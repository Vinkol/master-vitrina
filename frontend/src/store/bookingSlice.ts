import type { StateCreator } from 'zustand';
import type { BookingState, BookingSlice } from './types';
import { getStartParam } from '../shared/lib/getStartParam';

const finalMasterId = getStartParam();

export const createBookingSlice: StateCreator<BookingState, [], [], BookingSlice> = (set) => ({
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

  fetchMasterData: () => {
    set({ isRegistered: true });
  },
});
