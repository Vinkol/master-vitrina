import type { StateCreator } from 'zustand';
import type { BookingState, BookingSlice, Service, MasterProfile } from './types';
import { getStartParam } from '../shared/lib/getStartParam';

const finalMasterId = getStartParam();

export const createBookingSlice: StateCreator<BookingState, [], [], BookingSlice> = (set, get) => ({
  currentScreen: finalMasterId ? 'profile' : 'admin-placeholder-main',
  appointments: [],
  currentMasterId: finalMasterId || null,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  isRegistered: null,
  isOwner: false,

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setScreen: (screen) => {
    if (finalMasterId && screen.startsWith('admin-')) {
      return;
    }
    set({ currentScreen: screen });
  },

  setAppointmentsLocally: (appointments) => set({ appointments }),

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  goToConfirm: () => set({ currentScreen: 'booking-confirm' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),

  resetBooking: () => {
    const defaultHome = finalMasterId ? 'profile' : 'admin-placeholder-main';
    set({
      currentScreen: defaultHome,
      selectedService: null,
      selectedDate: '',
      selectedTime: '',
    });
  },

  fetchMasterData: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      set({ isRegistered: true });
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

      console.log('Загрузка публичных данных мастера для клиента...');

      const [profileRes, servicesRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/master/public/master/${masterId}`, { method: 'GET' }),
        fetch(`${baseUrl}/api/v1/master/public/master/${masterId}/services`, { method: 'GET' }),
      ]);

      if (!profileRes.ok) throw new Error('Не удалось загрузить публичный профиль мастера');
      if (!servicesRes.ok) throw new Error('Не удалось загрузить публичные услуги мастера');

      const masterProfileData = (await profileRes.json()) as MasterProfile;
      const servicesData = (await servicesRes.json()) as Service[];

      // Наполняем Zustand-состояние, чтобы витрина клиента ожила
      set({
        masterProfile: masterProfileData,
        services: servicesData,
      });
    } catch (e) {
      console.error('Ошибка при загрузке публичных данных мастера для витрины:', e);
    }
  },
});
