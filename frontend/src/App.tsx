import { useEffect } from 'react';
import { useBookingStore } from './store/useBookingStore';
import { AuthGuard } from './navigation/AuthGuard';
import { TabBar } from './navigation/TabBar';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  // Берём флаги из нашего готового authSlice
  const isMaster = useBookingStore((state) => state.isRegisteredMaster);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const isLoading = useBookingStore((state) => state.isLoading);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Раскрываем Mini App на весь экран смартфона
    }
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20 select-none antialiased">
        {/* НАВИГАЦИЯ ТАБ БАРА: показываем только верифицированному мастеру в его админке */}
        {!isLoading && isAuthenticated && isMaster && <TabBar />}
      </div>
      <SpeedInsights />
    </AuthGuard>
  );
}
