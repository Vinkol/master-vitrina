// src/store/authSlice.ts
import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState } from './types';
import type { AppStatus, UserRole, AuthResponse } from '../types/auth';
import type { TelegramWebApp } from '../types/telegram';

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
  'query_id=AA_Dev_Session&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22MasterDev%22%7D&hash=dev_mock_hash';

export const createAuthSlice: StateCreator<BookingState, [], [], AuthSliceState> = (set, get) => ({
  appStatus: 'LOADING',
  currentRole: null,
  authToken: null,
  isOwner: false,

  setAppStatus: (status) => set({ appStatus: status }),

  initializeAuth: async (tgInstance) => {
    set({ appStatus: 'LOADING' });

    let initData: string | undefined = undefined;

    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
    } else if (isDevelopment) {
      console.warn('[Zustand Auth]: Включен Mock-режим для ПК.');
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      set({ appStatus: 'UNAUTHORIZED', isRegistered: false });
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      let data: AuthResponse;

      if (isDevelopment && initData === MOCK_TG_INIT_DATA) {
        data = {
          registered: false,
          telegramId: 123456789,
        };
      } else {
        if (!supabaseUrl) {
          throw new Error(
            'Критическая ошибка: Переменная VITE_SUPABASE_URL не задана в окружении приложения',
          );
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          throw new Error('Бэкенд отклонил авторизацию Telegram');
        }

        data = await response.json();
      }

      if (data.registered === false) {
        set({
          appStatus: 'REGISTRATION',
          isRegistered: false,
          currentRole: 'master',
          isOwner: true,
        });
      } else {
        const token = data.token;
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        const profile =
          data.masterProfile && data.masterProfile.length > 0 ? data.masterProfile[0] : null;
        const fallbackTgId = tgInstance?.initDataUnsafe?.user?.id || 123456789;
        const targetMasterId = profile ? profile.owner_tg_id : fallbackTgId;

        set({
          appStatus: 'AUTHORIZED',
          isRegistered: true,
          currentRole: data.role,
          authToken: token,
          masterProfile: profile,
          currentMasterId: targetMasterId,
          isOwner: data.role === 'master',
        });

        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
      }
    } catch (error) {
      console.error('Критическая ошибка авторизации через токен:', error);
      set({ appStatus: 'UNAUTHORIZED', isRegistered: false });
    }
  },

  executeRegistrationInFunction: async (name, tgInstance) => {
    set({ appStatus: 'LOADING' });

    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let initData: string | undefined = undefined;

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
    } else if (isDevelopment) {
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      set({ appStatus: 'UNAUTHORIZED' });
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      let data: AuthResponse;

      if (isDevelopment && initData === MOCK_TG_INIT_DATA) {
        console.log('[Zustand Auth]: Локальная регистрация на ПК. Сетевой запрос пропущен.');
        data = {
          registered: true,
          role: 'master',
          token: 'mock_developer_jwt_token',
          masterProfile: [
            {
              id: 'mock-uuid-developer-123',
              owner_tg_id: 123456789,
              name: name,
              bio: 'Добро пожаловать в мою студию!',
              avatar: '💅',
              schedule: [],
            },
          ],
        };
      } else {
        if (!supabaseUrl) {
          throw new Error('Критическая ошибка: Переменная VITE_SUPABASE_URL не задана в окружении');
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData, name }),
        });

        if (!response.ok) {
          throw new Error('Ошибка создания профиля на бэкенде');
        }

        data = await response.json();
      }

      if (data.registered === true) {
        const token = data.token;

        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        const profile =
          data.masterProfile && data.masterProfile.length > 0 ? data.masterProfile[0] : null;
        const fallbackTgId = tgInstance?.initDataUnsafe?.user?.id || 123456789;
        const targetMasterId = profile ? profile.owner_tg_id : fallbackTgId;

        set({
          appStatus: 'AUTHORIZED',
          isRegistered: true,
          currentRole: data.role,
          authToken: token,
          masterProfile: profile,
          currentMasterId: targetMasterId,
          currentScreen: 'admin-dashboard',
          isOwner: true,
        });

        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
      }
    } catch (error) {
      console.error('Критическая ошибка создания профиля:', error);
      set({ appStatus: 'UNAUTHORIZED' });
    }
  },
});
