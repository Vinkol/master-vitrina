import type { StateCreator } from 'zustand';
import type { BookingState, MasterSlice } from './types';

export const createMasterSlice: StateCreator<BookingState, [], [], MasterSlice> = (set, get) => ({
  masterProfile: null,
  services: [],

  // мутатор профиля
  updateProfileInDB: (updatedFields) => {
    return set((state) => {
      const currentProfile = state.masterProfile || {
        id: get().currentMasterId || '',
        telegram_id: 0,
        name: 'Мастер',
        bio: '',
        avatar: '',
        schedule: [],
        currency: 'RUB',
        slot_step: 30,
        client_buffer: 360,
        master_buffer: 120,
      };
      return { masterProfile: { ...currentProfile, ...updatedFields } };
    });
  },

  // сеттер списка услуг
  setServicesLocally: (services) => set({ services }),

  // мутаторы для мгновенного обновления интерфейса
  addService: (service) => {
    const optimisticService = {
      ...service,
      id: crypto.randomUUID(),
    };
    set((state) => ({ services: [...state.services, optimisticService] }));
  },

  updateService: (id, updatedService) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, ...updatedService } : s)),
    }));
  },

  deleteService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    }));
  },
});
