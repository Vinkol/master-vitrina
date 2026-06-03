import type { StateCreator } from 'zustand';
import type { BookingState, AuthState, RegisterMasterPayload, SessionUser } from './types';

export const createAuthSlice: StateCreator<BookingState, [], [], AuthState> = (set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isRegisteredMaster: false,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  currentMasterId: null,

  initAuth: async () => {
    set({ isLoading: true });

    const tg = window.Telegram?.WebApp;

    // Сообщаем Telegram, что наше SPA-приложение полностью загрузилось и готово к работе
    if (tg && typeof tg.ready === 'function') {
      tg.ready();
    }

    // КРИТИЧЕСКИЙ СЕНЬОР-ФИКС: Если SDK еще пустой, вытаскиваем данные напрямую из хэша URL
    let initData = tg?.initData || '';

    if (!initData && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      initData = hashParams.get('tgWebAppData') || '';
    }

    if (!initData) {
      console.warn('Данные Telegram не найдены. Режим разработки.');
      set({ isLoading: false });
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/functions/v1/auth-tg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      if (response.status === 404) {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isRegisteredMaster: false,
          isLoading: false,
        });
        return;
      }

      if (!response.ok) throw new Error('Ошибка авторизации на бэкенде');
      const data = await response.json();

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      const startParam = tg?.initDataUnsafe?.start_param;
      if (startParam && startParam !== 'reg') {
        set({
          accessToken: data.access_token,
          user: data.user,
          isAuthenticated: true,
          isRegisteredMaster: data.isRegisteredMaster,
          currentMasterId: startParam,
          isLoading: false,
        });
      } else {
        set({
          accessToken: data.access_token,
          user: data.user,
          isAuthenticated: true,
          isRegisteredMaster: data.isRegisteredMaster,
          currentMasterId: data.user.id,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Критическая ошибка реальной авторизации:', err);
      set({ isLoading: false, isAuthenticated: false, isRegisteredMaster: false });
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        set({ accessToken: session.access_token, user: session.user as unknown as SessionUser });
      }
    });
  },

  registerMaster: async (profileData: RegisterMasterPayload) => {
    set({ isLoading: true });
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    try {
      // Безопасно очищаем URL от слешей на конце
      const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '');

      // Отправляем запрос на регистрацию мастера на бэкенд
      const response = await fetch(`${baseUrl}/functions/v1/auth-tg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, isRegistration: true, profile: profileData }),
      });

      // Парсим ответ. Если бэкенд вернул ошибку, вытаскиваем её текст
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Не удалось зарегистрировать мастера');
      }

      const data = await response.json();

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      set({
        accessToken: data.access_token,
        user: data.user,
        isAuthenticated: true,
        isRegisteredMaster: true,
        currentMasterId: data.user.id,
        isLoading: false,
      });
      return true;
    } catch (err) {
      console.error(err);

      // Вытаскиваем читаемый текст ошибки
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка сети';

      // Показываем красивый нативный алерт Telegram на весь экран телефона
      if (tg && typeof tg.showAlert === 'function') {
        tg.showAlert(`⚠️ Ошибка регистрации:\n\n${errorMessage}`);
      } else {
        // Запасной вариант для дебага в обычном браузере
        alert(`Ошибка: ${errorMessage}`);
      }

      set({ isLoading: false });
      return false;
    }
  },
  setTokens: async (accessToken: string, refreshToken: string) => {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    supabase.auth.signOut();
    set({ accessToken: null, user: null, isAuthenticated: false, isRegisteredMaster: false });
  },
});
