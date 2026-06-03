from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, time, datetime, timedelta

from src.database import get_db
from src.models import Service, UserMaster, ClientAppointment, ClientAppointmentResponse

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
    is_master: bool = False,  # Фронтенд будет передавать, кто запрашивает: мастер или клиент
    db: AsyncSession = Depends(get_db)
):
    """
    Возвращает список доступных таймслотов с учётом перерывов, 
    занятых записей и временных барьеров (как на фронтенде).
    """
    # 1. ЗАЩИТА ОТ ПРОШЛЫХ ДНЕЙ
    today = date.today()
    if target_date < today:
        return []

    # 2. Получаем профиль мастера из облака Supabase
    result = await db.execute(select(UserMaster).where(UserMaster.id == master_id))
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
            ClientAppointment.master_id == master_id,
            ClientAppointment.date == target_date
        )
    )
    existing_appointments = result.scalars().all()

    available_slots = []
    slot_step_minutes = 30  # Шаг сетки как на фронте

    # 6. Главный цикл генерации слотов (точь-в-точь по логике твоего фронта)
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

        # Проверка пересечения с другими клиентами (с учётом реальной длительности каждой услуги)
        for app in existing_appointments:
            # 1. Переводим время старта существующей записи в минуты
            app_start = time_to_minutes(app.time.strftime("%H:%M"))
            
            # 2. Ищем в базе данных услугу по её названию, чтобы узнать её честную длительность
            # На случай, если услугу удалили, ставим дефолт в 60 минут как подстраховку
            service_result = await db.execute(
                select(Service).where(
                    Service.master_id == master_id,
                    Service.title == app.service_title
                )
            )
            existing_service = service_result.scalar_one_or_none()
            app_duration = existing_service.duration if existing_service else 60
            
            app_end = app_start + app_duration

            # Формула пересечения интервалов: слот пересекается, если он начался до конца старой записи и закончился после её начала
            if slot_start < app_end and slot_end > app_start:
                is_interrupted = True
                break


        # Если слот чистый — добавляем его в список доступных
        if not is_interrupted:
            available_slots.append(minutes_to_time_str(slot_start))

        current += slot_step_minutes

    return available_slots
