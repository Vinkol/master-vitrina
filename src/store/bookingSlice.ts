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

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setRole: (role) =>
    set({
      currentRole: role,
      currentScreen: role === 'master' ? 'admin-placeholder-main' : 'profile',
    }),

  setScreen: (screen) => set({ currentScreen: screen }),

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

  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;

    try {
      const tgInstance = window.Telegram?.WebApp;
      const clientUsername = tgInstance?.initDataUnsafe?.user?.username
        ? `@${tgInstance.initDataUnsafe.user.username}`
        : 'Через ТГ по ссылке';

      const newAppointment = {
        master_tg_id: currentMasterId,
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
            masterProfile: null,
          });
          return;
        }
      } else {
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

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),
  resetBooking: () =>
    set({ currentScreen: 'profile', selectedService: null, selectedDate: '', selectedTime: '' }),
});
