import { create } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { Service, MasterProfile, DaySchedule, Appointment } from '../types';

type Screen =
  | 'profile'
  | 'calendar'
  | 'admin-dashboard'
  | 'admin-services'
  | 'admin-profile-edit'
  | 'admin-hours-edit'
  | 'admin-link-share'
  | 'admin-placeholder-main'
  | 'admin-placeholder-clients';

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

  appointments: Appointment[];
  fetchAppointments: () => Promise<void>;
  createAppointment: (clientName: string) => Promise<void>;

  // Стор мультимастера
  currentMasterId: number | null;
  botUsername: string;
  botAppName: string;
  isRegistered: boolean | null;

  fetchMasterData: (tgInstance: TelegramInstance | undefined) => Promise<void>;
  registerMaster: (name: string, tgInstance: TelegramInstance | undefined) => Promise<void>;

  masterProfile: MasterProfile | null;
  services: Service[];

  fetchProfile: () => Promise<void>;
  updateProfileInDB: (updatedFields: Partial<MasterProfile>) => Promise<void>;

  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'master_tg_id'>) => Promise<void>;
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

const defaultSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  day_index: i,
  is_working: i < 5,
  working_start: '10:00',
  working_end: '20:00',
  breaks: [],
}));

export const useBookingStore = create<BookingState>((set, get) => ({
  currentRole: 'client',
  currentScreen: 'profile',
  appointments: [],

  currentMasterId: null,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  isRegistered: null,

  masterProfile: null,
  services: [],

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setRole: (role) =>
    set({
      currentRole: role,
      currentScreen: role === 'master' ? 'admin-placeholder-main' : 'profile',
    }),

  setScreen: (screen) => set({ currentScreen: screen }),

  // Инициализация при старте приложения
  fetchMasterData: async (tgInstance) => {
    try {
      const currentTgUser = tgInstance?.initDataUnsafe?.user;
      const startParam = tgInstance?.initDataUnsafe?.start_param;
      let targetMasterId: number | undefined = undefined;
      let isOwner = false;
      if (currentTgUser?.id) {
        if (startParam) {
          targetMasterId = parseInt(startParam, 10) || undefined;
          isOwner = targetMasterId === currentTgUser.id;
        } else {
          targetMasterId = currentTgUser.id;
          isOwner = true;
        }

        // Проверяем наличие профиля по owner_tg_id
        const { data: checkProfile } = await supabase
          .from('profiles')
          .select('owner_tg_id')
          .eq('owner_tg_id', targetMasterId ?? 0)
          .maybeSingle();

        if (isOwner && !checkProfile) {
          set({
            isRegistered: false,
            currentRole: 'master',
            currentScreen: 'admin-dashboard',
            currentMasterId: targetMasterId,
            masterProfile: null, // Будет создан при вызове registerMaster
          });
          return;
        }
      } else {
        // Режим локальной отладки в браузере (ПК)
        const { data: fallbackList } = await supabase
          .from('profiles')
          .select('owner_tg_id')
          .limit(1);

        if (fallbackList && fallbackList.length > 0) {
          targetMasterId = fallbackList[0].owner_tg_id;
          isOwner = true;
        } else {
          targetMasterId = 123456789;
          isOwner = true;
          set({
            isRegistered: false,
            currentRole: 'master',
            currentScreen: 'admin-dashboard',
            currentMasterId: targetMasterId,
            masterProfile: null,
          });
          return;
        }
      }
      set({
        currentMasterId: targetMasterId ?? 123456789,
        currentRole: isOwner ? 'master' : 'client',
        currentScreen: isOwner ? get().currentScreen : 'profile',
        isRegistered: true,
      });
      await Promise.all([get().fetchProfile(), get().fetchServices(), get().fetchAppointments()]);
    } catch (e) {
      console.error('Ошибка мультимастерной инициализации:', e);
    }
  },

  // Регистрация нового мастера
  registerMaster: async (name, tgInstance) => {
    try {
      const currentTgUser = tgInstance?.initDataUnsafe?.user;
      const tgId = currentTgUser?.id || 123456789;
      const newProfile = {
        owner_tg_id: tgId,
        name,
        bio: 'Добро пожаловать в мою студию записи!',
        avatar: '💅',
        schedule: defaultSchedule,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set({
          masterProfile: data as MasterProfile,
          currentMasterId: data.owner_tg_id,
          isRegistered: true,
          currentRole: 'master',
          currentScreen: 'admin-dashboard',
        });
      }
    } catch (e) {
      console.error('Ошибка регистрации мастера в БД:', e);
    }
  },

  // Получение профиля мастера
  fetchProfile: async () => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('owner_tg_id', masterTgId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        set({ masterProfile: data as MasterProfile });
      } else {
        set({ isRegistered: false });
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля мастера:', err);
    }
  },

  // Обновление профиля мастера
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
        masterProfile: state.masterProfile ? { ...state.masterProfile, ...updatedFields } : null,
      }));
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    }
  },

  // Получение списка услуг мастера
  fetchServices: async () => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('master_tg_id', masterTgId);

      if (data && !error) {
        set({ services: data as Service[] });
      }
    } catch (e) {
      console.error('Ошибка загрузки услуг:', e);
    }
  },

  // Добавление новой услуги
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
        set((state) => ({ services: [...state.services, data as Service] }));
      }
    } catch (err) {
      console.error('Ошибка сохранения услуги:', err);
    }
  },

  // Обновление существующей услуги
  updateService: async (id, updatedService) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .update(updatedService)
        .eq('id', id)
        .eq('master_tg_id', masterTgId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? (data as Service) : s)),
        }));
      }
    } catch (err) {
      console.error('Не удалось обновить услугу в Supabase:', err);
    }
  },

  // Удаление услуги
  deleteService: async (id) => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('master_tg_id', masterTgId);

      if (error) throw error;

      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('Не удалось удалить услугу из Supabase:', err);
    }
  },

  // Получение списка всех записей мастера
  fetchAppointments: async () => {
    const masterTgId = get().currentMasterId;
    if (!masterTgId) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('master_tg_id', masterTgId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      if (data) set({ appointments: data as Appointment[] });
    } catch (e) {
      console.error('Ошибка получения записей из БД:', e);
    }
  },

  // Создание новой записи клиента
  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;
    try {
      const newAppointment = {
        master_tg_id: currentMasterId,
        service_title: selectedService.title,
        date: selectedDate,
        time: selectedTime,
        client_name: clientName,
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
