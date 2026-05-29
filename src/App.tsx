import { useEffect } from 'react';
import { useBookingStore } from './store/useBookingStore';
import { AuthGuard } from './navigation/AuthGuard';
import { ClientRouter } from './navigation/ClientRouter';
import { AdminRouter } from './navigation/AdminRouter';
import { TabBar } from './navigation/TabBar';
import type { TelegramWebApp } from './types/telegram';

const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp as TelegramWebApp;
  }
  return null;
};

export default function App() {
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

  // Вычисляем права доступа
  // Если мы в режиме разработки на ПК (нет tg), мы разрешаем админку для отладки
  // Если мы на реальном телефоне в браузере, !tg НЕ должен делать пользователя владельцем
  const isDevelopment =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const currentTgId = tg?.initDataUnsafe?.user?.id;
  const ownerTgId = masterProfile?.owner_tg_id;

  const isOwner =
    (isDevelopment && !tg) ||
    (currentTgId && ownerTgId && Number(currentTgId) === Number(ownerTgId));

  return (
    <AuthGuard tg={tg}>
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 select-none">
        {/* РОУТЕР КЛИЕНТА: Показывается обычным клиентам или мастеру, если включена роль клиента */}
        {currentRole === 'client' && <ClientRouter />}

        {/* РОУТЕР АДМИНКИ: Доступен только если пользователь верифицирован как владелец профиля */}
        {currentRole === 'master' && isOwner && <AdminRouter />}

        {/* НАВИГАЦИЯ ТАБ БАРА: Рендерится исключительно в режиме администрирования мастера */}
        {currentRole === 'master' && isOwner && <TabBar />}
      </div>
    </AuthGuard>
  );
}
