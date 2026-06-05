import uuid
from datetime import date, time
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from src.database import get_db
from src.models import ClientAppointment, BlockedClient
from src.schemas import CRMClientResponse, ClientBlockPayload

router = APIRouter(prefix="/master", tags=["crm"])

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

    # Получаем телефоны заблокированных клиентов для этого мастера
    blocked_query = select(BlockedClient.client_phone).where(BlockedClient.master_id == master_id)
    blocked_result = await db.execute(blocked_query)
    # Извлекаем строки из кортежей SQLAlchemy результата
    blocked_phones = {row[0].strip() for row in blocked_result.all()}

    # Строим основной запрос агрегации по таблице записей 'client'
    query = (
        select(
            ClientAppointment.client_name,
            ClientAppointment.client_phone,
            func.count(ClientAppointment.id).label("visits_count"),
            func.max(ClientAppointment.date).label("last_visit_date")
        )
        .where(ClientAppointment.master_id == master_id)
        .group_by(ClientAppointment.client_phone, ClientAppointment.client_name)
    )

    # Поиск по имени или телефону
    if search:
        query = query.having(
            or_(
                ClientAppointment.client_name.ilike(f"%{search}%"),
                ClientAppointment.client_phone.ilike(f"%{search}%")
            )
        )

    result = await db.execute(query)
    all_grouped_clients = result.all()

    # Формируем список объектов и проверяем статус блокировки
    mapped_clients = []
    for row in all_grouped_clients:
        phone_clean = row.client_phone.strip()
        is_blocked = phone_clean in blocked_phones
        
        client_obj = {
            "client_name": row.client_name,
            "client_phone": row.client_phone,
            "visits_count": row.visits_count,
            "last_visit_date": row.last_visit_date,
            "is_blocked": is_blocked
        }
        mapped_clients.append(client_obj)

    # Фильтрация по табам (all, new, loyal, blocked)
    if filter == "blocked":
        mapped_clients = [c for c in mapped_clients if c["is_blocked"]]
    elif filter == "new":
        mapped_clients = [c for c in mapped_clients if c["visits_count"] == 1 and not c["is_blocked"]]
    elif filter == "loyal":
        mapped_clients = [c for c in mapped_clients if c["visits_count"] >= 3 and not c["is_blocked"]]
    elif filter != "all":
        mapped_clients = [c for c in mapped_clients if not c["is_blocked"]]

    # Сортировка по количеству визитов
    mapped_clients.sort(key=lambda x: x["visits_count"], reverse=True)

    # 6. Применяем пагинацию к отфильтрованному массиву
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