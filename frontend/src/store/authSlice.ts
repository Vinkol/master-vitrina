import type { StateCreator } from 'zustand';
import type { BookingState, AuthState, SessionUser } from './types';

// Описываем интерфейс ответа от нашего FastAPI бэкенда
interface FastAPIAuthResponse {
  access_token: string;
  token_type: string;
}

// Описываем структуру внутренностей JWT токена
interface JWTDecodedPayload {
  sub: string;
  telegram_id: number;
  exp: number;
}

export const createAuthSlice: StateCreator<BookingState, [], [], AuthState> = (set, get) => ({
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

    if (tg && typeof tg.ready === 'function') {
      tg.ready();
    }

    let initData = tg?.initData || '';

    if (!initData && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      initData = hashParams.get('tgWebAppData') || '';
    }

    if (!initData && import.meta.env.DEV) {
      initData = 'test';
    }

    if (!initData) {
      console.warn('Данные Telegram не найдены. Режим разработки.');
      set({ isLoading: false });
      return;
    }

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

      const response = await fetch(`${baseUrl}/api/v1/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData }),
      });

      if (response.status === 401 || response.status === 404) {
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

      // Явно указываем тип ответа сервера вместо any
      const data = (await response.json()) as FastAPIAuthResponse;

      // Декодируем JWT-токен и типизируем его payload
      const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1])) as JWTDecodedPayload;
      const masterUuid = tokenPayload.sub;

      const startParam = tg?.initDataUnsafe?.start_param;

      // Создаем строго типизированный объект пользователя
      const sessionUser: SessionUser = {
        id: masterUuid,
        name: 'Мастер',
      };

      set({
        accessToken: data.access_token,
        user: sessionUser,
        isAuthenticated: true,
        isRegisteredMaster: true,
        currentMasterId: startParam && startParam !== 'reg' ? startParam : masterUuid,
        isLoading: false,
      });

      void (async () => {
        const store = get();
        await store.fetchProfile();
        await store.fetchServices();
        await store.fetchAppointments();
      })();
    } catch (err) {
      console.error('Критическая ошибка авторизации через FastAPI:', err);
      set({ isLoading: false, isAuthenticated: false, isRegisteredMaster: false });
    }
  },

  registerMaster: async () => {
    set({ isLoading: true });
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData || 'test';

      const response = await fetch(`${baseUrl}/api/v1/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData }),
      });

      if (!response.ok) throw new Error('Не удалось выполнить авторегистрацию');
      const data = (await response.json()) as FastAPIAuthResponse;

      set({
        accessToken: data.access_token,
        isAuthenticated: true,
        isRegisteredMaster: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
      return false;
    }
  },

  setTokens: (accessToken: string) => {
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isRegisteredMaster: false,
      currentMasterId: null,
    });
  },
});
