import { useBookingStore } from '../store/bookingStore';

export function TabBar() {
  const { currentScreen, setScreen } = useBookingStore();

  type ScreenType = Parameters<typeof setScreen>[0];

  const handleNavigation = (screen: ScreenType) => {
    setScreen(screen);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp as unknown as Record<string, unknown> & {
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
      };

      webApp.HapticFeedback?.impactOccurred('light');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-slate-200/60 flex items-center justify-around px-2 z-40 max-w-md mx-auto rounded-t-2xl shadow-lg pb-[env(safe-area-inset-bottom)]">
      {/* 1. ГЛАВНАЯ (Заглушка) */}
      <button
        onClick={() => handleNavigation('admin-placeholder-main')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-placeholder-main' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <span className="text-xl">📅</span>
        <span>Главная</span>
      </button>

      {/* 2. КАТАЛОГ */}
      <button
        onClick={() => handleNavigation('admin-services')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-services' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <span className="text-xl">✂️</span>
        <span>Каталог</span>
      </button>

      {/* 3. КЛИЕНТЫ (Заглушка) */}
      <button
        onClick={() => handleNavigation('admin-placeholder-clients')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-placeholder-clients' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <span className="text-xl">👥</span>
        <span>Клиенты</span>
      </button>

      {/* 4. ЕЩЕ (Настройки / Профиль из твоего App.tsx) */}
      <button
        onClick={() => handleNavigation('admin-dashboard')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-dashboard' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <span className="text-xl">⚙️</span>
        <span>Профиль</span>
      </button>
    </div>
  );
}
