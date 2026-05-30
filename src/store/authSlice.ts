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
    console.log('[DEBUG AUTH]: Запуск initializeAuth...');
    set({ appStatus: 'LOADING' });

    let initData: string | undefined = undefined;

    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const globalTg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
      console.log('[DEBUG AUTH]: initData взят из аргумента tgInstance');
    } else if (globalTg && 'initData' in globalTg && globalTg.initData) {
      initData = globalTg.initData;
      console.log('[DEBUG AUTH]: initData взят напрямую из глобального window.Telegram');
    } else if (isDevelopment) {
      console.warn('[DEBUG AUTH]: Окружение разработки (ПК). Подставляем MOCK_TG_INIT_DATA.');
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      console.error(
        '[DEBUG AUTH]: Ошибка! initData полностью отсутствует. Невозможно верифицировать сессию.',
      );
      set({ appStatus: 'UNAUTHORIZED', isRegistered: false });
      return;
    }

    try {
      const supabaseUrl =
        import.meta.env.VITE_SUPABASE_URL || 'https://beynlmclrkttmektxzav.supabase.co';
      let data: AuthResponse;

      if (isDevelopment && initData === MOCK_TG_INIT_DATA) {
        console.log(
          '[DEBUG AUTH]: Ветка разработки (ПК). Имитируем, что пользователя НЕТ в базе, чтобы отладить форму регистрации.',
        );
        data = {
          registered: false,
          telegramId: 123456789,
        };
      } else {
        console.log(
          `[DEBUG AUTH]: Отправляем POST запрос на Edge Function: ${supabaseUrl}/functions/v1/telegram-auth`,
        );

        const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        console.log(
          `[DEBUG AUTH]: Получен статус ответа от Edge Function: ${response.status} ${response.statusText}`,
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error(
            `[DEBUG AUTH Критическая ошибка]: Сервер вернул ошибку выполнения! Текст ошибки:`,
            errText,
          );
          throw new Error(`Бэкенд вернул статус ${response.status}. Детали: ${errText}`);
        }

        data = await response.json();
        console.log('[DEBUG AUTH]: Успешный JSON ответ от Edge Function получении сессии:', data);
      }

      if (data.registered === false) {
        console.log(
          '[DEBUG AUTH]: Пользователь не зарегистрирован. Переключаем интерфейс на экран REGISTRATION.',
        );
        set({
          appStatus: 'REGISTRATION',
          isRegistered: false,
          currentRole: 'master',
          isOwner: true,
        });
      } else {
        console.log(
          '[DEBUG AUTH]: Мастер успешно найден в БД. Инициализируем сессию Supabase Auth...',
        );
        const token = data.token;

        const isRealJwt = typeof token === 'string' && token.startsWith('eyJ');

        if (isRealJwt) {
          console.log('[DEBUG AUTH]: Обнаружен валидный JWT токен. Устанавливаем сессию...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });

          if (sessionError) {
            console.error(
              '[DEBUG AUTH]: supabase.auth.setSession завершился с ошибкой JWT:',
              sessionError,
            );
            throw sessionError;
          }
          console.log('[DEBUG AUTH]: Сессия Supabase установлена успешно.');
        } else {
          console.warn(
            '[DEBUG AUTH]: Токен является моком разработки. Шаг setSession безопасно пропущен.',
          );
        }

        const profile =
          data.masterProfile && data.masterProfile.length > 0 ? data.masterProfile[0] : null;
        const fallbackTgId = tgInstance?.initDataUnsafe?.user?.id || 123456789;
        const targetMasterId = profile ? profile.owner_tg_id : fallbackTgId;

        console.log('[DEBUG AUTH]: Записываем профиль мастера в Zustand стейт:', profile);

        set({
          appStatus: 'AUTHORIZED',
          isRegistered: true,
          currentRole: data.role,
          authToken: token,
          masterProfile: profile,
          currentMasterId: targetMasterId,
          isOwner: data.role === 'master',
        });

        console.log(
          '[DEBUG AUTH]: Запускаем параллельный сбор доменных данных (Services, Appointments)...',
        );
        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
        console.log('[DEBUG AUTH]: Сбор данных завершен.');
      }
    } catch (error) {
      console.error('[DEBUG AUTH КРИТИЧЕСКИЙ СБОЙ В БЛОКЕ CATCH]:', error);
      set({ appStatus: 'UNAUTHORIZED', isRegistered: false });
    }
  },

  executeRegistrationInFunction: async (name, tgInstance) => {
    console.log(
      `[DEBUG REGISTRATION]: Вызов executeRegistrationInFunction с именем бизнеса: "${name}"`,
    );
    set({ appStatus: 'LOADING' });

    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let initData: string | undefined = undefined;
    const globalTg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

    if (tgInstance?.initData) {
      initData = tgInstance.initData;
    } else if (globalTg && 'initData' in globalTg && globalTg.initData) {
      initData = globalTg.initData;
    } else if (isDevelopment) {
      initData = MOCK_TG_INIT_DATA;
    }

    if (!initData) {
      console.error('[DEBUG REGISTRATION]: Отмена регистрации. initData пуст.');
      set({ appStatus: 'UNAUTHORIZED' });
      return;
    }

    try {
      const supabaseUrl =
        import.meta.env.VITE_SUPABASE_URL || 'https://beynlmclrkttmektxzav.supabase.co';
      let data: AuthResponse;

      if (isDevelopment && initData === MOCK_TG_INIT_DATA) {
        console.warn(
          '[DEBUG REGISTRATION]: Эмуляция ПК. Сетевой запрос пропущен. Генерируем тестовый успешный профиль...',
        );

        data = {
          registered: true,
          role: 'master',
          token: 'mock_developer_jwt_token_for_pc_debugging',
          masterProfile: [
            {
              id: 'dev-generated-uuid-999',
              owner_tg_id: 123456789,
              name: name,
              bio: 'Локальный отладочный профиль',
              avatar: '⚙️',
              schedule: [],
            },
          ],
        };
      } else {
        console.log(
          `[DEBUG REGISTRATION]: Отправляем запрос на регистрацию: ${supabaseUrl}/functions/v1/telegram-auth`,
        );

        const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData, name }),
        });

        console.log(`[DEBUG REGISTRATION]: Статус ответа сервера: ${response.status}`);

        if (!response.ok) {
          const errText = await response.text();
          console.error(
            `[DEBUG REGISTRATION КРИТИЧЕСКАЯ ОШИБКА]: Бэкенд Edge-функции отклонил регистрацию! Детали:`,
            errText,
          );
          throw new Error(`Ошибка Edge-функции при регистрации (${response.status}): ${errText}`);
        }

        data = await response.json();
        console.log(
          '[DEBUG REGISTRATION]: Успешно создан профиль на бэкенде. Получен Payload:',
          data,
        );
      }

      if (data.registered === true) {
        console.log('[DEBUG REGISTRATION]: Парсим токен сессии...');
        const token = data.token;

        if (!token) {
          console.error(
            '[DEBUG REGISTRATION ОШИБКА]: Бэкенд вернул пустой token! Сессия Supabase не может быть создана.',
          );
          throw new Error(
            'Критический сбой данных: В ответе сервера отсутствует JWT токен сессии.',
          );
        }

        const isRealJwt = typeof token === 'string' && token.startsWith('eyJ');

        if (isRealJwt) {
          console.log('[DEBUG REGISTRATION]: Устанавливаем реальную сессию Supabase Auth...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });

          if (sessionError) {
            console.error(
              '[DEBUG REGISTRATION ОШИБКА]: Ошибка применения токена в клиент Supabase Auth:',
              sessionError,
            );
            throw sessionError;
          }
          console.log('[DEBUG REGISTRATION]: Сессия Supabase установлена успешно.');
        } else {
          console.warn(
            '[DEBUG REGISTRATION]: Использование мок-токена разработки. Вызов setSession пропущен.',
          );
        }

        console.log('[DEBUG REGISTRATION]: Токен сессии применен. Извлекаем профиль мастера...');
        const profile =
          data.masterProfile && data.masterProfile.length > 0 ? data.masterProfile[0] : null;
        const fallbackTgId = tgInstance?.initDataUnsafe?.user?.id || 123456789;
        const targetMasterId = profile ? profile.owner_tg_id : fallbackTgId;

        console.log(
          '[DEBUG REGISTRATION]: Обновляем глобальный Zustand стейт, включаем админку...',
        );
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

        console.log('[DEBUG REGISTRATION]: Подгружаем связанные доменные сущности...');

        await Promise.all([get().fetchServices(), get().fetchAppointments()]);
        console.log('[DEBUG REGISTRATION]: Процесс завершен. Переход выполнен.');
      } else {
        console.warn(
          '[DEBUG REGISTRATION]: Внимание! Сервер вернул registered: false на шаге создания профиля!',
        );
        throw new Error(
          'Бэкенд вернул флаг незарегистрированного пользователя на этапе отправки формы.',
        );
      }
    } catch (error) {
      console.error('[DEBUG REGISTRATION КРИТИЧЕСКИЙ СБОЙ В БЛОКЕ CATCH]:', error);
      set({ appStatus: 'UNAUTHORIZED' });
    }
  },
});
