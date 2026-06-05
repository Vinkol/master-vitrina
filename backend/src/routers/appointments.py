import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, time, datetime

from src.schemas import ClientAppointmentResponse, ClientAppointmentCreate
from src.database import get_db
from src.models import Service, UserMaster, ClientAppointment

router = APIRouter(prefix="/appointments", tags=["appointments"])

def time_to_minutes(t_str: str) -> int:
    """Перевод строки '14:30' в количество минут с начала дня"""
    hours, minutes = map(int, t_str.split(':'))
    return hours * 60 + minutes

def minutes_to_time_str(total_minutes: int) -> str:
    """Перевод минут обратно в красивую строку '14:30'"""
    hours = total_minutes // 60
    minutes = total_minutes % 60
    return f"{hours:02d}:{minutes:02d}"

@router.post("", response_model=ClientAppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: ClientAppointmentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт создания записи. Используется мастером для ручной записи 
    или клиентом при бронировании онлайн.
    """
    service_result = await db.execute(
        select(Service).where(
            Service.master_id == payload.master_id,
            Service.id == payload.service_id
        )
    )
    service = service_result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Выбранная услуга не найдена")

    try:
        hours, minutes = map(int, payload.time.split(':'))
        appointment_time = time(hours, minutes)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Некорректный формат времени. Ожидается 'HH:MM'"
        )

    new_app = ClientAppointment(
        master_id=service.master_id,
        service_id=service.id, 
        service_title=service.title,
        date=payload.date,                   
        time=appointment_time,              
        client_name=payload.client_name,
        client_phone=payload.client_phone
    )

    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    return new_app

@router.get("/master/{master_id}", response_model=list[ClientAppointmentResponse])
async def get_master_appointments(
    master_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт для мастера. Возвращает список всех записей клиентов 
    к конкретному мастеру для его CRM-журнала.
    """
    result = await db.execute(
        select(ClientAppointment)
        .where(ClientAppointment.master_id == master_id)
        .order_by(ClientAppointment.date.asc(), ClientAppointment.time.asc())
    )
    return result.scalars().all()

@router.get("/slots")
async def get_available_slots(
    master_id: str,
    target_date: date,
    duration_minutes: int,
    is_master: bool = False,  # Фронтенд передает, кто запрашивает: мастер или клиент
    db: AsyncSession = Depends(get_db)
):
    """
    Возвращает список доступных таймслотов с учётом перерывов, 
    занятых записей и временных барьеров.
    """
    # Валидация формата UUID для мастера (защита от падения PostgreSQL)
    try:
        master_uuid = uuid.UUID(master_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный UUID мастера")

    # 1. ЗАЩИТА ОТ ПРОШЛЫХ ДНЕЙ
    today = date.today()
    if target_date < today:
        return []

    # 2. Получаем профиль мастера
    result = await db.execute(select(UserMaster).where(UserMaster.id == master_uuid))
    master = result.scalar_one_or_none()
    if not master or not master.schedule:
        return []

    # 3. Проверяем день недели (0 - Понедельник ... 6 - Воскресенье)
    day_index = target_date.weekday()
    day_config = next((d for d in master.schedule if d.get("day_index") == day_index), None)
    
    if not day_config or not day_config.get("is_working"):
        return []

    # Переводим рабочие часы в минуты
    work_start = time_to_minutes(day_config["working_start"])
    work_end = time_to_minutes(day_config["working_end"])
    breaks = day_config.get("breaks", [])

    # 4. ВРЕМЕННОЙ БАРЬЕР (Если день сегодняшний, вычисляем буфер)
    time_barrier_minutes = 0
    if target_date == today:
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        # Мастеру +2 часа (120 мин), клиенту +6 часов (360 мин)
        buffer_minutes = 120 if is_master else 360
        time_barrier_minutes = current_minutes + buffer_minutes

    # 5. Получаем уже существующие записи клиентов из таблицы client
    result = await db.execute(
        select(ClientAppointment).where(
            ClientAppointment.master_id == master_uuid,
            ClientAppointment.date == target_date
        )
    )
    existing_appointments = result.scalars().all()

    available_slots = []
    slot_step_minutes = 30  # Шаг сетки как на фронте

    # 6. Главный цикл генерации слотов
    current = work_start
    while current + duration_minutes <= work_end:
        slot_start = current
        slot_end = current + duration_minutes

        # ЗАЩИТА ОТ ПРОШЕДШЕГО ВРЕМЕНИ И БУФЕРОВ
        if target_date == today and slot_start < time_barrier_minutes:
            current += slot_step_minutes
            continue

        is_interrupted = False

        # Проверка пересечения с перерывами мастера
        for brk in breaks:
            break_start = time_to_minutes(brk["start"])
            break_end = time_to_minutes(brk["end"])
            if slot_start < break_end and slot_end > break_start:
                is_interrupted = True
                break

        if is_interrupted:
            current += slot_step_minutes
            continue

        # Проверка пересечения с другими клиентами
        for app in existing_appointments:
            app_start = time_to_minutes(app.time.strftime("%H:%M"))
            
            # ГИБРИДНЫЙ ПОИСК ДЛИТЕЛЬНОСТИ УСЛУГИ
            existing_service = None
            
            # А. Сначала пробуем найти услугу по точному service_id (если он записан в строке таблицы client)
            if getattr(app, 'service_id', None):
                service_result = await db.execute(
                    select(Service).where(
                        Service.master_id == master_uuid,
                        Service.id == app.service_id
                    )
                )
                existing_service = service_result.scalar_one_or_none()
            
            # Б. Если по ID не нашли или поле пустое — ищем по названию (для обратной совместимости со старыми записями)
            if not existing_service and app.service_title:
                service_result = await db.execute(
                    select(Service).where(
                        Service.master_id == master_uuid,
                        Service.title == app.service_title  # Запрос строго бьется с твоим Service.title
                    )
                )
                existing_service = service_result.scalar_one_or_none()
            
            # В. Если услугу вообще удалили из прайса, ставим дефолт в 60 минут подстраховки
            app_duration = existing_service.duration if existing_service else 60
            
            app_end = app_start + app_duration

            # Формула пересечения интервалов
            if slot_start < app_end and slot_end > app_start:
                is_interrupted = True
                break

        # Если слот чистый — добавляем его в список доступных
        if not is_interrupted:
            available_slots.append(minutes_to_time_str(slot_start))

        current += slot_step_minutes

    return available_slots