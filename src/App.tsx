import { useEffect } from 'react';
import { useBookingStore } from './store/bookingStore';
import { AuthGuard } from './components/layouts/AuthGuard';
import { ClientRouter } from './views/ClientRouter';
import { AdminRouter } from './views/AdminRouter';
import { TabBar } from './components/navigation/TabBar';
import type { TelegramWebApp } from './types';
import { Loader } from './components/ui/Loader';

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

  // Вычисляем права доступа (Секретная админка)
  const currentTgId = tg?.initDataUnsafe?.user?.id;
  const ownerTgId = masterProfile?.owner_tg_id;
  const isMaster = !tg || (currentTgId && ownerTgId && Number(currentTgId) === Number(ownerTgId));

  if (!masterProfile) {
    return <Loader text="Загрузка панели" />;
  }

  return (
    <AuthGuard tg={tg}>
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
        {/* Главный роутинг ролей */}
        {currentRole === 'client' && <ClientRouter />}
        {currentRole === 'master' && isMaster && <AdminRouter />}
        {/* Навигация только для верифицированного владельца */}
        {isMaster && <TabBar />}
      </div>
    </AuthGuard>
  );
}

export default App;
