import uuid
from datetime import date, time, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from src.database import get_db
from src.models import ClientAppointment, BlockedClient
from src.schemas import CRMClientResponse, ClientBlockPayload

router = APIRouter(prefix="/master", tags=["crm"])

def format_russian_date(d: date | None) -> str | None:
    """Превращает объект date в красивую строку на русском языке"""
    if not d:
        return None
    today = date.today()
    if d == today:
        return "Сегодня"
    if d == today - timedelta(days=1):
        return "Вчера"       
    months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ]
    return f"{d.day:02d} {months[d.month - 1]} {d.year}"

@router.get("/{master_id}/crm-clients", response_model=list[CRMClientResponse])
async def get_crm_clients(
    master_id: uuid.UUID,
    search: str | None = Query(None),
    filter: str = Query("all"),
    page: int = Query(0),
    size: int = Query(20),
    db: AsyncSession = Depends(get_db)
):
    """
    Умный CRM-эндпоинт. Группирует уникальных клиентов из таблицы client,
    считает их визиты, фильтрует по категориям и проверяет ЧС.
    """
    offset_value = page * size
    today = date.today()

    # Получаем заблокированных
    blocked_query = select(BlockedClient.client_phone).where(BlockedClient.master_id == master_id)
    blocked_result = await db.execute(blocked_query)
    blocked_phones = {row.strip() for row in blocked_result.all()}

    # запрос с разделением на ПРОШЛЫЕ и БУДУЩИЕ визиты
    query = (
        select(ClientAppointment)
        .where(ClientAppointment.master_id == master_id)
        .order_by(ClientAppointment.date.desc(), ClientAppointment.time.desc())
    )
    
    result = await db.execute(query)
    appointments = result.scalars().all()

    # Группируем клиентов вручную на Python
    clients_dict = {}
    for app in appointments:
        key = (app.client_phone.strip(), app.client_name.strip())
        
        if key not in clients_dict:
            clients_dict[key] = {
                "client_name": app.client_name,
                "client_phone": app.client_phone,
                "visits_count": 0,
                "past_dates": [],
                "future_dates": []
            }
        
        clients_dict[key]["visits_count"] += 1
        
        # Раскладываем даты на прошлые и предстоящие визиты
        if app.date <= today:
            clients_dict[key]["past_dates"].append(app.date)
        else:
            clients_dict[key]["future_dates"].append(app.date)

    # Формируем массив объектов для фильтрации и сортировки
    mapped_clients = []
    for key, info in clients_dict.items():
        phone_clean = info["client_phone"].strip()
        is_blocked = phone_clean in blocked_phones
        
        last_visit = max(info["past_dates"]) if info["past_dates"] else None
        next_visit = min(info["future_dates"]) if info["future_dates"] else None
        has_future = next_visit is not None

        if search:
            search_lower = search.lower()
            if search_lower not in info["client_name"].lower() and search_lower not in phone_clean:
                continue

        client_obj = {
            "master_id": master_id,
            "client_name": info["client_name"],
            "client_phone": info["client_phone"],
            "visits_count": info["visits_count"],
            "last_visit_date": last_visit,  
            "next_visit_date": next_visit,  
            "is_blocked": is_blocked,
            "has_future_appointment": has_future
        }
        mapped_clients.append(client_obj)

    # Фильтрация по 5 табам
    if filter == "blocked":
        mapped_clients = [c for c in mapped_clients if c["is_blocked"]]
    elif filter == "loyal":
        mapped_clients = [c for c in mapped_clients if c["visits_count"] >= 2 and not c["is_blocked"]]
    elif filter == "new":
        mapped_clients = [c for c in mapped_clients if c["visits_count"] == 1 and not c["is_blocked"]]
    elif filter == "active":
        mapped_clients = [c for c in mapped_clients if c["has_future_appointment"] and not c["is_blocked"]]
    elif filter != "all":
        mapped_clients = [c for c in mapped_clients if not c["is_blocked"]]

    # СОРТИРОВКА ПО СВЕЖЕСТИ ПРОШЛОГО ВИЗИТА
    mapped_clients.sort(
        key=lambda x: x["last_visit_date"] if x["last_visit_date"] is not None else date.min, 
        reverse=True
    )

    # Текстовое форматирование дат на русском языке перед отправкой
    for c in mapped_clients:
        if c["last_visit_date"] is None and c["next_visit_date"] is not None:
            c["last_visit_date"] = f"Записан на {format_russian_date(c['next_visit_date'])}"
        else:
            c["last_visit_date"] = format_russian_date(c["last_visit_date"])

    return mapped_clients[offset_value : offset_value + size]


@router.post("/clients/block", status_code=status.HTTP_200_OK)
async def block_client(payload: ClientBlockPayload, db: AsyncSession = Depends(get_db)):
    """Добавление клиента в черный список мастера"""
    phone_clean = payload.client_phone.strip()
    
    existing = await db.execute(
        select(BlockedClient).where(
            and_(BlockedClient.master_id == payload.master_id, BlockedClient.client_phone == phone_clean)
        )
    )
    if existing.scalar_one_or_none():
        return {"status": "already_blocked"}

    new_block = BlockedClient(
        master_id=payload.master_id,
        client_phone=phone_clean
    )
    db.add(new_block)
    await db.commit()
    return {"status": "success"}


@router.post("/clients/unblock", status_code=status.HTTP_200_OK)
async def unblock_client(payload: ClientBlockPayload, db: AsyncSession = Depends(get_db)):
    """Удаление клиента из черного списка мастера"""
    phone_clean = payload.client_phone.strip()
    
    result = await db.execute(
        select(BlockedClient).where(
            and_(BlockedClient.master_id == payload.master_id, BlockedClient.client_phone == phone_clean)
        )
    )
    block_record = result.scalar_one_or_none()
    
    if not block_record:
        raise HTTPException(status_code=404, detail="Запись в черном списке не найдена")

    await db.delete(block_record)
    await db.commit()
    return {"status": "success"}