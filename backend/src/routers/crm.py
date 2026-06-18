import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc, case

from src.database import get_db
from src.models import ClientAppointment, BlockedClient
from src.schemas import CRMClientResponse

router = APIRouter(prefix="/master", tags=["crm"])

def format_russian_date(d: date | None) -> str | None:
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
    offset_value = page * size
    today = date.today()
    stmt = (
        select(
            func.trim(ClientAppointment.client_name).label("client_name"),
            func.trim(ClientAppointment.client_phone).label("client_phone"),
            func.count(ClientAppointment.id).label("visits_count"),
            func.max(case((ClientAppointment.date <= today, ClientAppointment.date), else_=None)).label("last_visit_date"),
            func.min(case((ClientAppointment.date > today, ClientAppointment.date), else_=None)).label("next_visit_date"),
            case((BlockedClient.id.isnot(None), True), else_=False).label("is_blocked")
        )
        .select_from(ClientAppointment)
        .join(
            BlockedClient,
            and_(
                BlockedClient.master_id == master_id,
                func.trim(BlockedClient.client_phone) == func.trim(ClientAppointment.client_phone)
            ),
            isouter=True
        )
        .where(ClientAppointment.master_id == master_id)
        .group_by(
            func.trim(ClientAppointment.client_name),
            func.trim(ClientAppointment.client_phone),
            BlockedClient.id
        )
    )

    if search:
        search_arg = f"%{search.strip().lower()}%"
        stmt = stmt.having(
            or_(
                func.lower(func.trim(ClientAppointment.client_name)).like(search_arg),
                func.trim(ClientAppointment.client_phone).like(search_arg)
            )
        )

    if filter == "blocked":
        stmt = stmt.having(BlockedClient.id.isnot(None))
    elif filter == "loyal":
        stmt = stmt.having(and_(func.count(ClientAppointment.id) >= 3, BlockedClient.id.is_() if filter == "blocked" else BlockedClient.id.is_(None)))
    elif filter == "new":
        stmt = stmt.having(and_(func.count(ClientAppointment.id) == 1, BlockedClient.id.is_(None)))
    elif filter == "active":
        stmt = stmt.having(and_(func.min(case((ClientAppointment.date > today, ClientAppointment.date), else_=None)).isnot(None), BlockedClient.id.is_(None)))
    elif filter != "all":
        stmt = stmt.having(BlockedClient.id.is_(None))

    stmt = stmt.order_by(desc("last_visit_date"), desc("client_name"))
    stmt = stmt.limit(size).offset(offset_value)
    result = await db.execute(stmt)
    rows = result.all()

    mapped_clients = []
    for row in rows:
        last_visit = row.last_visit_date
        next_visit = row.next_visit_date
        has_future = next_visit is not None

        if last_visit is None and next_visit is not None:
            last_visit_str = f"Записан на {format_russian_date(next_visit)}"
        else:
            last_visit_str = format_russian_date(last_visit)

        mapped_clients.append({
            "master_id": master_id,
            "client_name": row.client_name,
            "client_phone": row.client_phone,
            "visits_count": row.visits_count,
            "last_visit_date": last_visit_str,
            "next_visit_date": next_visit,
            "is_blocked": row.is_blocked,
            "has_future_appointment": has_future
        })

    return mapped_clients
