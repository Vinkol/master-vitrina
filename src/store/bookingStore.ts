import { create } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { Service, MasterProfile } from '../types';

type Screen =
  | 'profile'
  | 'calendar'
  | 'admin-dashboard'
  | 'admin-services'
  | 'admin-profile-edit'
  | 'admin-hours-edit'
  | 'admin-link-share';

type Role = 'client' | 'master';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramInstance {
  initDataUnsafe?: {
    user?: TelegramUser;
    start_param?: string;
  };
}

interface BookingState {
  currentRole: Role;
  currentScreen: Screen;
  setRole: (role: Role) => void;
  setScreen: (screen: Screen) => void;
  createAppointment: (clientName: string) => Promise<void>;
  appointments: unknown[];
  fetchAppointments: () => Promise<void>;

  // Стейты мультимастера
  currentMasterId: number | null;
  botUsername: string;
  botAppName: string;
  isRegistered: boolean;
  fetchMasterData: (tgInstance: TelegramInstance | undefined) => Promise<void>;
  registerMaster: (name: string, tgInstance: TelegramInstance | undefined) => Promise<void>;

  masterProfile: MasterProfile;
  services: Service[];

  fetchProfile: () => Promise<void>;
  fetchServices: () => Promise<void>;
  updateProfileInDB: (updatedFields: Partial<MasterProfile>) => Promise<void>;

  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updatedService: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  selectService: (service: Service) => void;
  setDate: (date: string) => void;
  setTime: (slot: string) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentRole: 'client',
  currentScreen: 'profile',
  appointments: [],

  currentMasterId: null,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  isRegistered: true,

  masterProfile: {
    name: 'Загрузка...',
    bio: 'Загрузка данных...',
    avatar: '💅',
    working_start: '10:00',
    working_end: '20:00',
  },
  services: [],

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setRole: (role) =>
    set({
      currentRole: role,
      currentScreen: role === 'master' ? 'admin-dashboard' : 'profile',
    }),
  setScreen: (screen) => set({ currentScreen: screen }),

  // Главный метод инициализации при старте по Telegram ID
  fetchMasterData: async (tgInstance) => {
    try {
      const currentTgUser = tgInstance?.initDataUnsafe?.user;
      const startParam = tgInstance?.initDataUnsafe?.start_param;

      let targetMasterId = null;
      let isOwner = false;

      // 1. ЕСЛИ ЗАПУСК ВНУТРИ ТЕЛЕГРАМА
      if (currentTgUser?.id) {
        if (startParam) {
          // Клиент перешел по ссылке мастера
          targetMasterId = parseInt(startParam, 10) || null;
          isOwner = targetMasterId === currentTgUser.id;
        } else {
          // Прямой запуск бота из чата мастером
          targetMasterId = currentTgUser.id;
          isOwner = true;
        }
      }
      // 2. ЕСЛИ ЗАПУСК НА ПК В БРАУЗЕРЕ ДЛЯ ТЕСТОВ (Фолбек)
      else {
        const { data: fallbackList } = await supabase
          .from('profiles')
          .select('owner_tg_id')
          .limit(1);
        if (fallbackList && fallbackList.length > 0) {
          targetMasterId = fallbackList[0].owner_tg_id;
          isOwner = true; // В браузере притворяемся админом
        }
      }

      // Если мастера вообще нет в базе — включаем экран регистрации
      if (targetMasterId && isOwner) {
        const { data: checkProfile } = await supabase
          .from('profiles')
          .select('owner_tg_id')
          .eq('owner_tg_id', targetMasterId)
          .maybeSingle();

        if (!checkProfile) {
          set({
            isRegistered: false,
            currentRole: 'master',
            currentScreen: 'admin-dashboard',
            currentMasterId: targetMasterId,
            masterProfile: {
              name: '',
              bio: '',
              avatar: '💅',
              working_start: '10:00',
              working_end: '20:00',
            },
          });
          return;
        }
      }

      set({
        currentMasterId: targetMasterId,
        currentRole: isOwner ? 'master' : 'client',
        currentScreen: isOwner ? get().currentScreen : 'profile',
        isRegistered: true,
      });

      // Скачиваем данные конкретного мастера
      await get().fetchProfile();
      await get().fetchServices();
      await get().fetchAppointments();
    } catch (e) {
      console.error('Ошибка мультимастерной инициализации:', e);
    }
  },

  // Регистрация нового мастера
  registerMaster: async (name, tgInstance) => {
    try {
      const currentTgUser = tgInstance?.initDataUnsafe?.user;
      const newProfile = {
        name,
        bio: 'Добро пожаловать в мою студию записи!',
        avatar: '💅',
        working_start: '10:00',
        working_end: '20:00',
        owner_tg_id: currentTgUser?.id || 123456789,
      };

      const { data, error } = await supabase.from('profiles').insert([newProfile]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        set({
          masterProfile: data[0],
          currentMasterId: data[0].owner_tg_id,
          isRegistered: true,
          currentRole: 'master',
          currentScreen: 'admin-dashboard',
        });
        console.log('Новый мастер зарегистрирован с Telegram ID:', data[0].owner_tg_id);
      }
    } catch (e) {
      console.error('Ошибка регистрации мастера в БД:', e);
    }
  },

  fetchProfile: async () => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_tg_id', masterTgId)
      .single();

    if (data && !error) {
      set({ masterProfile: data });
    }
  },

  fetchServices: async () => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('master_tg_id', masterTgId);

    if (data && !error) {
      set({ services: data });
    }
  },

  updateProfileInDB: async (updatedFields) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('owner_tg_id', masterTgId);

      if (error) throw error;

      set((state) => ({
        masterProfile: { ...state.masterProfile, ...updatedFields },
      }));
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    }
  },

  // 1. Добавление услуги
  addService: async (service) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...service, master_tg_id: masterTgId }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        set((state) => ({ services: [...state.services, data] }));
      }
    } catch (err) {
      console.error('Ошибка сохранения услуги:', err);
    }
  },

  // 2. Обновление услуги
  updateService: async (id, updatedService) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .update(updatedService)
        .eq('id', id)
        .eq('master_tg_id', masterTgId) // Гарантия, что мастер правит свою услугу
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? data : s)),
        }));
      }
    } catch (err) {
      console.error('Не удалось обновить услугу в Supabase:', err);
    }
  },

  // 3. Удаление услуги
  deleteService: async (id) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('master_tg_id', masterTgId); // Гарантия, что мастер удаляет свою услугу

      if (error) throw error;

      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('Не удалось удалить услугу из Supabase:', err);
    }
  },

  fetchAppointments: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('master_id', masterId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      if (data) set({ appointments: data });
    } catch (e) {
      console.error('Ошибка получения записей из БД:', e);
    }
  },

  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;

    try {
      const newAppointment = {
        service_title: selectedService.title,
        date: selectedDate,
        time: selectedTime,
        client_name: clientName,
        master_id: currentMasterId,
      };

      const { error } = await supabase.from('appointments').insert([newAppointment]);
      if (error) throw error;

      await get().fetchAppointments();
      get().resetBooking();
    } catch (e) {
      console.error('Ошибка создания записи в БД:', e);
    }
  },

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),
  resetBooking: () =>
    set({ currentScreen: 'profile', selectedService: null, selectedDate: '', selectedTime: '' }),
}));
