import { useBookingStore } from '../store/useBookingStore';
import { Home, Users, User, ToolCase } from 'lucide-react';

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
      {/* ГЛАВНАЯ */}
      <button
        onClick={() => handleNavigation('admin-placeholder-main')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-placeholder-main' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <Home
          className="w-5 h-5"
          strokeWidth={currentScreen === 'admin-placeholder-main' ? 2.5 : 2}
        />
        <span>Главная</span>
      </button>

      {/* КАТАЛОГ */}
      <button
        onClick={() => handleNavigation('admin-services')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-services' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <ToolCase className="w-5 h-5" strokeWidth={currentScreen === 'admin-services' ? 2.5 : 2} />
        <span>Каталог</span>
      </button>

      {/* КЛИЕНТЫ */}
      <button
        onClick={() => handleNavigation('admin-placeholder-clients')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-placeholder-clients' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <Users
          className="w-5 h-5"
          strokeWidth={currentScreen === 'admin-placeholder-clients' ? 2.5 : 2}
        />
        <span>Клиенты</span>
      </button>

      {/* Профиль */}
      <button
        onClick={() => handleNavigation('admin-dashboard')}
        className={`flex flex-col items-center space-y-0.5 w-16 text-[10px] font-bold transition-colors ${
          currentScreen === 'admin-dashboard' ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <User className="w-5 h-5" strokeWidth={currentScreen === 'admin-dashboard' ? 2.5 : 2} />
        <span>Профиль</span>
      </button>
    </div>
  );
}
