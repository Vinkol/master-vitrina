import { useEffect } from 'react';
import { useBookingStore } from './store/bookingStore';
import { MainView } from './views/MainView';
import { CalendarView } from './views/CalendarView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminServicesView } from './views/AdminServicesView';

// Инициализируем Telegram SDK один раз при старте приложения
const tgInstance = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
if (tgInstance) {
  tgInstance.ready();
  tgInstance.expand();
}

function App() {
  const {
    currentScreen,
    currentRole,
    setRole,
    fetchServices,
    fetchProfile,
    fetchAppointments,
    masterProfile,
  } = useBookingStore();

  useEffect(() => {
    fetchProfile();
    fetchServices();
    fetchAppointments();
  }, [fetchServices, fetchProfile, fetchAppointments]);

  // ПРОВЕРКА АВТОРИЗАЦИИ:
  // 1. Получаем реальный ID пользователя из Telegram SDK
  const currentTgId = tgInstance?.initDataUnsafe?.user?.id;
  // 2. Получаем ID владельца из нашей облачной базы данных profiles
  const ownerTgId = masterProfile.owner_tg_id;

  // 3. Мастер авторизован, если мы на ПК в браузере (для тестов) ИЛИ если зашедший ID совпал с ID из базы
  const isMaster =
    !tgInstance || (currentTgId && ownerTgId && Number(currentTgId) === Number(ownerTgId));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Локальный бар отладки для ПК (скроется в Телеграме) */}
      {!tgInstance && (
        <div className="bg-indigo-950 text-white text-[10px] px-4 py-1.5 flex justify-between items-center shadow-inner font-mono">
          <span>Режим разработки ПК (Админка доступна)</span>
          <span>Роль: {currentRole === 'master' ? 'МАСТЕР' : 'КЛИЕНТ'}</span>
        </div>
      )}

      {/* ДИСПЕТЧЕР ЭКРАНОВ КЛИЕНТА */}
      {currentRole === 'client' && (
        <>
          {currentScreen === 'profile' && <MainView />}
          {currentScreen === 'calendar' && <CalendarView />}
        </>
      )}

      {/* ДИСПЕТЧЕР ЭКРАНОВ МАСТЕРА */}
      {currentRole === 'master' && isMaster && (
        <>
          {currentScreen === 'admin-dashboard' && <AdminDashboardView />}
          {currentScreen === 'admin-services' && <AdminServicesView />}
        </>
      )}

      {/* НИЖНИЙ ТАБ-БАР: Показывается ТОЛЬКО если пользователь — верифицированный Мастер */}
      {isMaster && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-slate-200/60 flex items-center justify-around px-6 z-40 max-w-md mx-auto rounded-t-2xl shadow-lg">
          <button
            onClick={() => setRole('client')}
            className={`flex flex-col items-center space-y-0.5 text-xs font-bold transition-colors ${
              currentRole === 'client' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">🛍️</span>
            <span>Витрина (Клиент)</span>
          </button>

          <button
            onClick={() => setRole('master')}
            className={`flex flex-col items-center space-y-0.5 text-xs font-bold transition-colors ${
              currentRole === 'master' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Админка (Мастер)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
