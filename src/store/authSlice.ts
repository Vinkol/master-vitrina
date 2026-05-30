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
  setAppStatus: (status: AppStatus) => void;
  initializeAuth: (tgInstance: TelegramWebApp | null) => Promise<void>;
  executeRegistrationInFunction: (name: string, tgInstance: TelegramWebApp | null) => Promise<void>;
}

const MOCK_TG_INIT_DATA =
  'query_id=AA...&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22MasterDev%22%7D...';

export const createAuthSlice: StateCreator<BookingState, [], [], AuthSliceState> = (set, get) => ({
  appStatus: 'LOADING',
  currentRole: null,
  authToken: null,

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
      console.warn('[Zustand Auth]: Telegram SDK не найден. Включен Mock-режим для ПК.');
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      set({ appStatus: 'UNAUTHORIZED', isRegistered: false });
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
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
      const data: AuthResponse = await response.json();
      if (data.registered === false) {
        set({
          appStatus: 'REGISTRATION',
          isRegistered: false,
          currentRole: 'master',
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

      const data: AuthResponse = await response.json();

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
        });

        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
      }
    } catch (error) {
      console.error('Критическая ошибка создания профиля:', error);
      set({ appStatus: 'UNAUTHORIZED' });
    }
  },
});
