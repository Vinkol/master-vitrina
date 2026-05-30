import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState, BookingSlice, Appointment } from './types';

export const createBookingSlice: StateCreator<BookingState, [], [], BookingSlice> = (set, get) => ({
  currentRole: 'client',
  currentScreen: 'profile',
  appointments: [],
  currentMasterId: null,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  isRegistered: null,
  isOwner: false,

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setRole: (role) =>
    set({
      currentRole: role,
      currentScreen: role === 'master' ? 'admin-placeholder-main' : 'profile',
    }),

  setScreen: (screen) => set({ currentScreen: screen }),

  // Получение записей конкретного мастера
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
      if (data) set({ appointments: data as Appointment[] });
    } catch (e) {
      console.error('Ошибка получения записей из БД:', e);
    }
  },

  // Создание записи клиентом
  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;

    try {
      const tgInstance = window.Telegram?.WebApp;
      const clientUsername = tgInstance?.initDataUnsafe?.user?.username
        ? `@${tgInstance.initDataUnsafe.user.username}`
        : 'Через ТГ по ссылке';

      const newAppointment = {
        master_id: currentMasterId,
        service_title: selectedService.title,
        date: selectedDate,
        time: selectedTime,
        client_name: clientName,
        client_phone: clientUsername,
      };

      const { error } = await supabase.from('appointments').insert([newAppointment]);
      if (error) throw error;

      await get().fetchAppointments();
      get().resetBooking();
    } catch (e) {
      console.error('Ошибка создания записи в БД:', e);
    }
  },

  fetchMasterData: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      set({ isRegistered: true });
      await Promise.all([get().fetchProfile(), get().fetchServices(), get().fetchAppointments()]);
    } catch (e) {
      console.error('Ошибка при загрузке данных мастера для витрины:', e);
    }
  },

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),
  resetBooking: () =>
    set({ currentScreen: 'profile', selectedService: null, selectedDate: '', selectedTime: '' }),
});
