import { useEffect } from 'react';
import { useBookingStore } from './store/useBookingStore';
import { AuthGuard } from './navigation/AuthGuard';
import { ClientRouter } from './navigation/ClientRouter';
import { AdminRouter } from './navigation/AdminRouter';
import { TabBar } from './navigation/TabBar';
import type { TelegramWebApp } from './types/telegram';
import { SpeedInsights } from '@vercel/speed-insights/react';

const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp as TelegramWebApp;
  }
  return null;
};

export default function App() {
  const { initializeAuth, currentRole, isOwner } = useBookingStore();
  const tg = getTelegramWebApp();

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  useEffect(() => {
    initializeAuth(tg);
  }, [initializeAuth, tg]);

  return (
    <AuthGuard tg={tg}>
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 select-none">
        {/* РОУТЕР КЛИЕНТА */}
        {currentRole === 'client' && <ClientRouter />}

        {/* РОУТЕР АДМИНКИ */}
        {currentRole === 'master' && isOwner && <AdminRouter />}

        {/* НАВИГАЦИЯ ТАБ БАРА */}
        {currentRole === 'master' && isOwner && <TabBar />}
      </div>
      <SpeedInsights />
    </AuthGuard>
  );
}
