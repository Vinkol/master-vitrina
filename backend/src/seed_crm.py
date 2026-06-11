import asyncio
import uuid
import random
from datetime import date, timedelta, time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.config import settings
from src.models import ClientAppointment, BlockedClient

MASTER_ID = uuid.UUID("5ff7cdb8-38eb-4410-b952-d7f6f8653e5b")
FIRST_NAMES = ["Александр", "Дмитрий", "Сергей", "Андрей", "Алексей", "Евгений", "Иван", "Михаил", "Николай", "Игорь", "Анна", "Елена", "Мария", "Ольга", "Наталья", "Екатерина", "Татьяна", "Ирина", "Светлана", "Юлия"]
LAST_NAMES = ["Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петрова", "Смирнова", "Кузнецова"]

async def seed_data():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    print("🚀 Начинаем генерацию тестовой базы клиентов...")
    today = date.today()

    async with async_session() as session:
        for i in range(1, 61):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)} #{i}"
            phone = f"+7999{i:07d}"
            if i <= 15:
                visit_date = today - timedelta(days=random.randint(1, 30))
                app = ClientAppointment(
                    master_id=MASTER_ID,
                    service_title="Тестовая услуга",
                    client_name=name,
                    client_phone=phone,
                    date=visit_date,
                    time=time(12, 0)
                )
                session.add(app)
                
            elif i <= 35:
                for j in range(3):
                    visit_date = today - timedelta(days=random.randint(5, 60))
                    app = ClientAppointment(
                        master_id=MASTER_ID,
                        service_title="Тестовая услуга",
                        client_name=name,
                        client_phone=phone,
                        date=visit_date,
                        time=time(10 + j, 0)
                    )
                    session.add(app)
                    
            elif i <= 50:
                app_past = ClientAppointment(
                    master_id=MASTER_ID,
                    service_title="Тестовая услуга",
                    client_name=name,
                    client_phone=phone,
                    date=today - timedelta(days=5),
                    time=time(14, 0)
                )
                session.add(app_past)
                app_future = ClientAppointment(
                    master_id=MASTER_ID,
                    service_title="Тестовая услуга",
                    client_name=name,
                    client_phone=phone,
                    date=today + timedelta(days=random.randint(1, 10)),
                    time=time(16, 0)
                )
                session.add(app_future)
                
            else:
                app = ClientAppointment(
                    master_id=MASTER_ID,
                    service_title="Тестовая услуга",
                    client_name=name,
                    client_phone=phone,
                    date=today - timedelta(days=10),
                    time=time(9, 0)
                )
                session.add(app)
                
                block = BlockedClient(
                    master_id=MASTER_ID,
                    client_phone=phone
                )
                session.add(block)

        await session.commit()
        print(print("✅ База данных успешно заполнена! Добавлено 60 уникальных клиентов."))

if __name__ == "__main__":
    asyncio.run(seed_data())
