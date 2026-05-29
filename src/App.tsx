import { useEffect } from 'react';
import { useBookingStore } from './store/useBookingStore';
import { AuthGuard } from './navigation/AuthGuard';
import { ClientRouter } from './navigation/ClientRouter';
import { AdminRouter } from './navigation/AdminRouter';
import { TabBar } from './navigation/TabBar';
import type { TelegramWebApp } from './types/telegram';
import { Loader } from './components/common/Loader';

const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp as TelegramWebApp;
  }
  return null;
};

function App() {
  const { fetchMasterData, currentRole, masterProfile } = useBookingStore();

  const tg = getTelegramWebApp();

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  useEffect(() => {
    fetchMasterData(tg ?? undefined);
  }, [fetchMasterData, tg]);

  // Вычисляем права доступа (Является ли зашедший пользователь владельцем этой витрины)
  const currentTgId = tg?.initDataUnsafe?.user?.id;
  const ownerTgId = masterProfile?.owner_tg_id;
  const isOwner = !tg || (currentTgId && ownerTgId && Number(currentTgId) === Number(ownerTgId));

  if (!masterProfile) {
    return <Loader text="Загрузка панели..." />;
  }

  return (
    <AuthGuard tg={tg}>
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 select-none">
        {/* РОУТЕР КЛИЕНТА: Показывается обычным клиентам или мастеру в режиме предпросмотра */}
        {currentRole === 'client' && <ClientRouter />}

        {/* РОУТЕР АДМИНКИ: Доступен только если пользователь — владелец и включена роль мастера */}
        {currentRole === 'master' && isOwner && <AdminRouter />}

        {/* НАВИГАЦИЯ ТАБ БАРА: Рендерится в режиме администрирования */}
        {currentRole === 'master' && isOwner && <TabBar />}
      </div>
    </AuthGuard>
  );
}

export default App;
