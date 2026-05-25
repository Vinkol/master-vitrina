import { useEffect, useState } from 'react';
import { useBookingStore } from './store/bookingStore';
import { MainView } from './views/MainView';
import { CalendarView } from './views/CalendarView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminServicesView } from './views/AdminServicesView';
import { AdminLinkShareView } from './views/AdminLinkShareView';
import { AdminProfileEditView } from './views/AdminProfileEditView';
import { AdminHoursEditView } from './views/AdminHoursEditView';

// Безопасно инициализируем Telegram SDK
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
    fetchMasterData,
    masterProfile,
    isRegistered,
    registerMaster,
    currentMasterId,
  } = useBookingStore();

  const [newMasterName, setNewMasterName] = useState('');

  // При старте приложения передаем Telegram SDK для мультимастерной проверки
  useEffect(() => {
    fetchMasterData(tgInstance);
  }, [fetchMasterData]);

  // Обработчик формы создания новой витрины
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) return;
    registerMaster(newMasterName.trim(), tgInstance);
  };

  // ЭКРАН 1: Если мастер зашел впервые и не зарегистрирован в базе данных
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800 select-none">
        <form
          onSubmit={handleRegister}
          className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-100 space-y-5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 to-purple-500" />
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-2xl border border-indigo-100 mt-2">
            🚀
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Создать Свою Витрину</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed px-2">
              Вы вошли в систему первый раз. Введите название вашей студии или ваше имя, чтобы
              сгенерировать личную ссылку для записи.
            </p>
          </div>

          <div className="text-left space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Название бизнеса:
            </label>
            <input
              type="text"
              required
              placeholder="Например: Мастер Елена, Студия красоты"
              value={newMasterName}
              onChange={(e) => setNewMasterName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm active:scale-[0.99]"
          >
            Создать профиль мастера →
          </button>
        </form>
      </div>
    );
  }

  // ЭКРАН 2: Ожидание ответа от облачного сервера Supabase
  if (!masterProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 font-mono tracking-widest uppercase animate-pulse">
        Поиск мастера в облаке...
      </div>
    );
  }

  // ПРОВЕРКА АВТОРИЗАЦИИ АДМИНКИ:
  const currentTgId = tgInstance?.initDataUnsafe?.user?.id;
  const ownerTgId = masterProfile.owner_tg_id;
  // Админка доступна, если мы тестируем на ПК в браузере ИЛИ если зашедший ID совпал с ID владельца из БД
  const isMaster =
    !tgInstance || (currentTgId && ownerTgId && Number(currentTgId) === Number(ownerTgId));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Локальный инфо-бар отладки (отображается только на ПК в браузере) */}
      {!tgInstance && (
        <div className="bg-indigo-900 text-white text-[9px] px-4 py-1.5 flex justify-between items-center shadow-inner font-mono">
          <span>ID Текущего Мастера: {currentMasterId || 'нет'}</span>
          <span>Текущая роль: {currentRole === 'master' ? 'МАСТЕР' : 'КЛИЕНТ'}</span>
        </div>
      )}

      {/* ДИСПЕТЧЕР ЭКРАНОВ КЛИЕНТА (ВИТРИНА) */}
      {currentRole === 'client' && (
        <>
          {currentScreen === 'profile' && <MainView />}
          {currentScreen === 'calendar' && <CalendarView />}
        </>
      )}

      {/* ДИСПЕТЧЕР ЭКРАНОВ МАСТЕРА (АДМИНКА) */}
      {currentRole === 'master' && isMaster && (
        <>
          {currentScreen === 'admin-dashboard' && <AdminDashboardView />}
          {currentScreen === 'admin-services' && <AdminServicesView />}
          {currentScreen === 'admin-link-share' && <AdminLinkShareView />}
          {currentScreen === 'admin-profile-edit' && <AdminProfileEditView />}
          {currentScreen === 'admin-hours-edit' && <AdminHoursEditView />}
        </>
      )}

      {/* НИЖНИЙ ТАБ-БАР (Рендерится только если зашедший пользователь — верифицированный Владелец) */}
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
