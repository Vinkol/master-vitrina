import type { StateCreator } from 'zustand';
import type { BookingState, AuthState, MasterProfile } from './types';
import { getStartParam } from '../shared/lib/getStartParam';

interface FastAPIAuthResponse {
  access_token: string;
  token_type: string;
}

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
    tg?.ready();
    const startParam = getStartParam();
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
      const data = (await response.json()) as FastAPIAuthResponse;
      const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1])) as JWTDecodedPayload;

      set({
        accessToken: data.access_token,
        isAuthenticated: true,
      });

      const store = get();

      if (startParam && startParam !== 'reg') {
        console.log('Приложение запущено по ссылке клиента для мастера:', startParam);

        set({
          currentMasterId: startParam,
          isRegisteredMaster: false,
        });
        await store.fetchMasterData();
        store.setScreen('profile');
      } else {
        console.log('Приложение запущено в режиме мастера (админка)');

        try {
          const profileResponse = await fetch(`${baseUrl}/api/v1/master/profile`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${data.access_token}` },
          });

          if (profileResponse.status === 404) {
            set({
              isRegisteredMaster: false,
              masterProfile: null,
              user: { id: `tg_${tokenPayload.telegram_id}`, name: 'Новый Мастер' },
              currentMasterId: null,
              isLoading: false,
            });
            return;
          }

          if (!profileResponse.ok) throw new Error('Не удалось загрузить профиль мастера');

          const masterProfileData = (await profileResponse.json()) as MasterProfile;

          set({
            isRegisteredMaster: true,
            masterProfile: masterProfileData,
            user: { id: masterProfileData.id, name: masterProfileData.name },
            currentMasterId: masterProfileData.id,
          });

          await Promise.all([store.fetchServices(), store.fetchAppointments()]);
          store.setScreen('admin-placeholder-main');
        } catch (profileErr) {
          console.error('Ошибка при проверке профиля мастера:', profileErr);
          set({ isRegisteredMaster: false, masterProfile: null });
        }
      }

      set({ isLoading: false });
    } catch (err) {
      console.error('Критическая ошибка авторизации через FastAPI:', err);
      set({
        isLoading: false,
        isAuthenticated: false,
        isRegisteredMaster: false,
        masterProfile: null,
      });
    }
  },

  registerMaster: async (profileFields: { name: string; bio?: string; avatar?: string }) => {
    set({ isLoading: true });
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;

      if (!token) throw new Error('Отсутствует токен авторизации');

      const response = await fetch(`${baseUrl}/api/v1/master/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileFields.name,
          bio: profileFields.bio || '',
          avatar: profileFields.avatar || null,
          schedule: [],
        }),
      });

      if (!response.ok) throw new Error('Не удалось создать профиль мастера в БД');

      const newMasterData = (await response.json()) as MasterProfile;

      set({
        isRegisteredMaster: true,
        masterProfile: newMasterData,
        user: { id: newMasterData.id, name: newMasterData.name },
        currentMasterId: newMasterData.id,
        isLoading: false,
      });

      const store = get();
      await Promise.all([store.fetchServices(), store.fetchAppointments()]);
      store.setScreen('admin-dashboard');

      return true;
    } catch (err) {
      console.error('Ошибка регистрации мастера:', err);
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
      masterProfile: null,
    });
  },
});
