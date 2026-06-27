import uuid
from datetime import date, time, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

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
    """Эндпоинт создания записи с валидацией услуги"""
    service_result = await db.execute(
        select(Service).where(
            and_(Service.master_id == payload.master_id, Service.id == payload.service_id)
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
    return new_app

@router.get("/master/{master_id}", response_model=list[ClientAppointmentResponse])
async def get_master_appointments(
    master_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Возвращает список всех записей клиентов к мастеру"""
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
    is_master: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Генератор таймслотов с учетом динамических настроек из базы данных.
    """
    try:
        master_uuid = uuid.UUID(master_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный UUID мастера")

    today = date.today()
    if target_date < today:
        return []

    # Получаем профиль мастера из БД
    result = await db.execute(select(UserMaster).where(UserMaster.id == master_uuid))
    master = result.scalar_one_or_none()
    if not master or not master.schedule:
        return []

    # ЧИТАЕМ ДИНАМИЧЕСКИЕ НАСТРОЙКИ ИЗ БАЗЫ ДАННЫХ
    slot_step_minutes = getattr(master, "slot_step", 30) or 30
    client_buffer_attr = getattr(master, "client_buffer", 360) if getattr(master, "client_buffer", 360) is not None else 360
    master_buffer_attr = getattr(master, "master_buffer", 120) if getattr(master, "master_buffer", 120) is not None else 120
    day_index = target_date.weekday()
    
    # ПРОВЕРКА ИНДЕКСА: ищем расписание по дню недели day_index
    day_config = next((d for d in master.schedule if d.get("day_index") == day_index or d.get("day_id") == day_index), None)
    
    if not day_config or not day_config.get("is_working"):
        return []

    start_str = day_config.get("start_time") or day_config.get("working_start")
    end_str = day_config.get("end_time") or day_config.get("working_end")
    if not start_str or not end_str:
        return []

    work_start = time_to_minutes(start_str)
    work_end = time_to_minutes(end_str)

    # ПРИМЕНЯЕМ ДИНАМИЧЕСКИЕ БУФЕРЫ ВРЕМЕНИ
    time_barrier_minutes = 0
    if target_date == today:
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute
        # Берем настройки буферов из базы данных, которые изменил мастер!
        buffer_minutes = master_buffer_attr if is_master else client_buffer_attr
        time_barrier_minutes = current_minutes + buffer_minutes

    # Получаем ВСЕ записи мастера на этот день
    app_result = await db.execute(
        select(ClientAppointment).where(
            and_(ClientAppointment.master_id == master_uuid, ClientAppointment.date == target_date)
        )
    )
    existing_appointments = app_result.scalars().all()

    # Извлекаем ВСЕ услуги мастера ОДНИМ запросом для кэширования длительности
    service_result = await db.execute(select(Service).where(Service.master_id == master_uuid))
    services_list = service_result.scalars().all()
    
    services_by_id = {s.id: s.duration for s in services_list}
    services_by_title = {s.title.strip().lower(): s.duration for s in services_list}

    # Подготавливаем интервалы занятого времени в памяти
    busy_intervals = []
    for app in existing_appointments:
        app_start = time_to_minutes(app.time.strftime("%H:%M"))
        
        app_duration = 60
        if app.service_id and app.service_id in services_by_id:
            app_duration = services_by_id[app.service_id]
        elif app.service_title:
            title_clean = app.service_title.strip().lower()
            if title_clean in services_by_title:
                app_duration = services_by_title[title_clean]
                
        busy_intervals.append((app_start, app_start + app_duration))

    breaks = day_config.get("breaks") or []
    if not breaks and day_config.get("break_start") and day_config.get("break_end"):
        breaks = [{"start": day_config["break_start"], "end": day_config["break_end"]}]

    for brk in breaks:
        if brk.get("start") and brk.get("end"):
            busy_intervals.append((time_to_minutes(brk["start"]), time_to_minutes(brk["end"])))

    # Главный цикл генерации слотов
    available_slots = []
    current = work_start

    while current + duration_minutes <= work_end:
        slot_start = current
        slot_end = current + duration_minutes

        if target_date == today and slot_start < time_barrier_minutes:
            current += slot_step_minutes
            continue

        is_interrupted = False
        for b_start, b_end in busy_intervals:
            if slot_start < b_end and slot_end > b_start:
                is_interrupted = True
                break

        if not is_interrupted:
            available_slots.append(minutes_to_time_str(slot_start))

        # ИСПОЛЬЗУЕМ ДИНАМИЧЕСКИЙ ШАГ ИЗ БАЗЫ
        current += slot_step_minutes

    return available_slots