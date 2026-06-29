import uuid
from datetime import date, time, datetime
from sqlalchemy import BigInteger, Column, DateTime, Integer, String, ForeignKey, Date, Time, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base


class UserMaster(Base):
    """Таблица user_master — профили мастеров"""
    __tablename__ = "user_master"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar: Mapped[str | None] = mapped_column(String, nullable=True)
    schedule: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, server_default=text("'RUB'"), default="RUB")
    slot_step = Column(Integer, default=30, nullable=False)
    client_buffer = Column(Integer, default=360, nullable=False)
    master_buffer = Column(Integer, default=120, nullable=False)
    # Связи (Relationships)
    services: Mapped[list["Service"]] = relationship("Service", back_populates="master", cascade="all, delete-orphan")
    appointments: Mapped[list["ClientAppointment"]] = relationship("ClientAppointment", back_populates="master", cascade="all, delete-orphan")
    blocked_clients: Mapped[list["BlockedClient"]] = relationship("BlockedClient", back_populates="master", cascade="all, delete-orphan")

class Service(Base):
    """Таблица services — услуги мастера"""
    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    master_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_master.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)  # int8 на схеме
    duration: Mapped[int] = mapped_column(BigInteger, nullable=False) # int8 на схеме

    master: Mapped["UserMaster"] = relationship("UserMaster", back_populates="services")

class ClientAppointment(Base):
    """Таблица client — журнал записей (заказов) от клиентов"""
    __tablename__ = "client"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    master_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_master.id", ondelete="CASCADE"), nullable=False)
    service_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    service_title: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time: Mapped[time] = mapped_column(Time, nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(50), nullable=False)

    master: Mapped["UserMaster"] = relationship("UserMaster", back_populates="appointments")

class BlockedClient(Base):
    """Таблица blocked_clients — черный список клиентов"""
    __tablename__ = "blocked_clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    master_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_master.id", ondelete="CASCADE"), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(Date, default=date.today, server_default=text("now()"))

    master: Mapped["UserMaster"] = relationship("UserMaster", back_populates="blocked_clients")

class BetaRequest(Base):
    """Таблица заявок с сайта на платные подписки"""
    __tablename__ = "beta_requests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tg_username: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    plan_name: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )