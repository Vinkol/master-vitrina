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
  currentMasterId: string | null;
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

  // Главный метод инициализации при старте
  fetchMasterData: async (tgInstance) => {
    try {
      const currentTgUser = tgInstance?.initDataUnsafe?.user;
      const startParam = tgInstance?.initDataUnsafe?.start_param;

      let targetMasterId = null;
      let isOwner = false;

      if (startParam) {
        // Зашли по ссылке мастера
        targetMasterId = startParam;

        // ДОБАВЛЕНО: Проверяем, не является ли этот startParam профилем самого вошедшего юзера
        if (currentTgUser?.id) {
          const { data: ownProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('owner_tg_id', currentTgUser.id)
            .maybeSingle();

          // Если ID профиля совпал с ID из ссылки — значит зашел сам мастер
          if (ownProfile && ownProfile.id === startParam) {
            isOwner = true;
          }
        }
      } else if (currentTgUser?.id) {
        // Ищем существующего мастера по owner_tg_id
        const { data: foundProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('owner_tg_id', currentTgUser.id)
          .maybeSingle();

        if (foundProfile) {
          targetMasterId = foundProfile.id;
          isOwner = true;
        } else {
          // Если мастера нет в базе — включаем экран регистрации
          set({
            isRegistered: false,
            currentRole: 'master',
            currentScreen: 'admin-dashboard',
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

      // Если запуск на ПК в браузере (берем первую запись для тестов)
      if (!targetMasterId) {
        const { data: fallbackList } = await supabase.from('profiles').select('id').limit(1);
        if (fallbackList && fallbackList.length > 0) {
          targetMasterId = fallbackList[0].id;
        } else {
          set({
            isRegistered: false,
            currentRole: 'master',
            currentScreen: 'admin-dashboard',
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
        // ДОБАВЛЕНО: Если зашел клиент, перекидываем его на экран витрины,
        // а если мастер — оставляем на его текущем экране (например, админке)
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
          currentMasterId: data[0].id,
          isRegistered: true,
          currentRole: 'master',
          currentScreen: 'admin-dashboard',
        });
        console.log('Новый мастер зарегистрирован с ID:', data[0].id);
      }
    } catch (e) {
      console.error('Ошибка регистрации мастера в БД:', e);
    }
  },

  fetchProfile: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', masterId)
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        set({ masterProfile: data[0] });
      }
    } catch (e) {
      console.error('Ошибка получения профиля из БД:', e);
    }
  },

  fetchServices: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;
    try {
      const { data, error } = await supabase.from('services').select('*').eq('master_id', masterId);
      if (error) throw error;
      if (data) set({ services: data });
    } catch (e) {
      console.error('Ошибка получения услуг из БД:', e);
    }
  },

  updateProfileInDB: async (updatedFields) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;
    try {
      set((state) => ({ masterProfile: { ...state.masterProfile, ...updatedFields } }));
      const { error } = await supabase.from('profiles').update(updatedFields).eq('id', masterId);
      if (error) throw error;
    } catch (e) {
      console.error('Ошибка профиля в БД:', e);
    }
  },

  addService: async (newService) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...newService, master_id: masterId }])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        set((state) => ({ services: [...state.services, data[0]] }));
      }
    } catch (e) {
      console.error('Ошибка добавления услуги в БД:', e);
    }
  },

  updateService: async (id, updatedService) => {
    try {
      const { error } = await supabase.from('services').update(updatedService).eq('id', id);
      if (error) throw error;
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? { ...s, ...updatedService } : s)),
      }));
    } catch (e) {
      console.error('Ошибка обновления услуги в БД:', e);
    }
  },

  deleteService: async (id) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ services: state.services.filter((s) => s.id !== id) }));
    } catch (e) {
      console.error('Ошибка удаления услуги из БД:', e);
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
