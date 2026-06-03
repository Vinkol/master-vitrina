import enum
from datetime import datetime
from sqlalchemy import BigInteger, String, Integer, ForeignKey, DateTime, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    MASTER = "master"

class AppointmentStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    avatar_base64: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    services: Mapped[list["Service"]] = relationship("Service", back_populates="master", cascade="all, delete-orphan")
    appointments_as_client: Mapped[list["Appointment"]] = relationship("Appointment", foreign_keys="[Appointment.client_id]", back_populates="client")
    appointments_as_master: Mapped[list["Appointment"]] = relationship("Appointment", foreign_keys="[Appointment.master_id]", back_populates="master")

class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    master_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)

    master: Mapped["User"] = relationship("User", back_populates="services")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="service", cascade="all, delete-orphan")

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    master_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.BOOKED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    client: Mapped["User"] = relationship("User", foreign_keys=[client_id], back_populates="appointments_as_client")
    master: Mapped["User"] = relationship("User", foreign_keys=[master_id], back_populates="appointments_as_master")
    service: Mapped["Service"] = relationship("Service", back_populates="appointments")
