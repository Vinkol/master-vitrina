import { create } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { Service, MasterProfile } from '../types';

type Screen = 'profile' | 'calendar' | 'admin-dashboard' | 'admin-services';
type Role = 'client' | 'master';

interface BookingState {
  currentRole: Role;
  currentScreen: Screen;
  setRole: (role: Role) => void;
  setScreen: (screen: Screen) => void;
  createAppointment: (clientName: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[];
  fetchAppointments: () => Promise<void>;

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

  fetchProfile: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        set({ masterProfile: data[0] });
      }
    } catch (e) {
      console.error('Ошибка получения профиля из БД:', e);
    }
  },

  fetchServices: async () => {
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      if (data) set({ services: data });
    } catch (e) {
      console.error('Ошибка получения услуг из БД:', e);
    }
  },

  updateProfileInDB: async (updatedFields) => {
    try {
      set((state) => ({ masterProfile: { ...state.masterProfile, ...updatedFields } }));
      const { error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .not('name', 'is', null);
      if (error) throw error;
    } catch (e) {
      console.error('Ошибка профиля в БД:', e);
    }
  },

  addService: async (newService) => {
    try {
      const { data, error } = await supabase.from('services').insert([newService]).select();
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
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      if (data) set({ appointments: data });
    } catch (e) {
      console.error('Ошибка получения записей из БД:', e);
    }
  },

  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime } = get();
    if (!selectedService || !selectedDate || !selectedTime) return;

    try {
      const newAppointment = {
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
