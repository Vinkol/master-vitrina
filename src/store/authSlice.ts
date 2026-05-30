import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState } from './types';
import type { TelegramWebApp } from '../types/telegram';

export type AppStatus = 'LOADING' | 'UNAUTHORIZED' | 'REGISTRATION' | 'AUTHORIZED';
export type UserRole = 'client' | 'master';

export interface AuthSliceState {
  appStatus: AppStatus;
  currentRole: UserRole | null;
  authToken: string | null;
  isOwner: boolean;
  setAppStatus: (status: AppStatus) => void;
  initializeAuth: (tgInstance: TelegramWebApp | null) => Promise<void>;
  executeRegistrationInFunction: (name: string, tgInstance: TelegramWebApp | null) => Promise<void>;
}

const MOCK_TG_INIT_DATA =
  'query_id=AA_Dev_Session&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22MasterDev%22%2C%22username%22%3A%22dev_master%22%7D&hash=dev_mock_hash';

export const createAuthSlice: StateCreator<BookingState, [], [], AuthSliceState> = (set, get) => ({
  appStatus: 'LOADING',
  currentRole: null,
  authToken: null,
  isOwner: false,

  setAppStatus: (status) => set({ appStatus: status }),

  initializeAuth: async (tgInstance) => {
    console.log('[AUTH]: Инициализация...');
    set({ appStatus: 'LOADING' });

    let initData: string | undefined = undefined;
    let startParam: string | null = null;

    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const globalTg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
      startParam = tgInstance.initDataUnsafe?.start_param || null;
    } else if (globalTg && 'initData' in globalTg && globalTg.initData) {
      initData = globalTg.initData;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      startParam = globalTg.initDataUnsafe?.start_param || null;
    } else if (isDevelopment) {
      initData = MOCK_TG_INIT_DATA;
    }

    if (startParam) {
      console.log('[AUTH]: Обнаружен клиент мастера:', startParam);
      set({
        appStatus: 'AUTHORIZED',
        currentRole: 'client',
        isOwner: false,
        currentMasterId: startParam,
      });
      await get().fetchMasterData();
      return;
    }

    if (!initData) {
      set({ appStatus: 'UNAUTHORIZED' });
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Критическая ошибка: Переменные окружения для Supabase отсутствуют');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        throw new Error('Бэкенд отклонил авторизацию мастера');
      }

      const data = await response.json();

      if (data.registered === false) {
        set({
          appStatus: 'REGISTRATION',
          currentRole: 'master',
          isOwner: true,
        });
      } else {
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (sessionError || !sessionData.session)
          throw sessionError || new Error('Auth session generation failed');

        set({
          appStatus: 'AUTHORIZED',
          currentRole: 'master',
          authToken: sessionData.session.access_token,
          isOwner: true,
          currentMasterId: data.masterId,
        });

        try {
          await get().fetchProfile();
          await Promise.all([get().fetchServices(), get().fetchAppointments()]);
        } catch (e) {
          console.log('[AUTH]: Ошибка параллельной загрузки', e);
        }
      }
    } catch (error) {
      console.error('[AUTH КРИТИЧЕСКИЙ СБОЙ МАСТЕРА]:', error);
      set({ appStatus: 'UNAUTHORIZED' });
    }
  },

  executeRegistrationInFunction: async (name, tgInstance) => {
    console.log('[REGISTRATION]: Создание профиля мастера...', name);
    set({ appStatus: 'LOADING' });

    let initData: string | undefined = undefined;
    const globalTg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
    } else if (globalTg && 'initData' in globalTg && globalTg.initData) {
      initData = globalTg.initData;
    } else if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      set({ appStatus: 'UNAUTHORIZED' });
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Критическая ошибка: Переменные окружения для Supabase отсутствуют');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ initData, name, registerAsMaster: true }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания профиля на сервере');
      }

      const data = await response.json();

      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (sessionError || !sessionData.session)
        throw sessionError || new Error('Auth session generation failed');

      set({
        appStatus: 'AUTHORIZED',
        currentRole: 'master',
        authToken: sessionData.session.access_token,
        currentMasterId: data.masterId,
        isOwner: true,
      });

      try {
        await get().fetchProfile();
        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
      } catch (e) {
        console.log('[REGISTRATION]: Ошибка загрузки данных', e);
      }
    } catch (error) {
      console.error('[REGISTRATION КРИТИЧЕСКИЙ СБОЙ]:', error);
      set({ appStatus: 'UNAUTHORIZED' });
    }
  },
});
