import { useEffect } from 'react';
import { useBookingStore } from './store/useBookingStore';
import { AuthGuard } from './navigation/AuthGuard';
import { TabBar } from './navigation/TabBar';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { BookingState } from './store/types';

export default function App() {
  // Берём флаги из нашего готового authSlice
  const masterProfile = useBookingStore((state: BookingState) => state.masterProfile);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const isLoading = useBookingStore((state) => state.isLoading);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Раскрываем Mini App на весь экран смартфона
    }
  }, []);

  const showAdminTabBar =
    !isLoading &&
    isAuthenticated &&
    masterProfile &&
    masterProfile.name &&
    masterProfile.name !== 'Мастер';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20 select-none antialiased">
        {/* НАВИГАЦИЯ ТАБ БАРА: показываем только верифицированному мастеру в его админке */}
        {showAdminTabBar && <TabBar />}
      </div>
      <SpeedInsights />
    </AuthGuard>
  );
}
