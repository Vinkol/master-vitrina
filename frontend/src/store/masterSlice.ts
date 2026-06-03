import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState, MasterSlice, Service, MasterProfile } from './types';

export const createMasterSlice: StateCreator<BookingState, [], [], MasterSlice> = (set, get) => ({
  masterProfile: null,
  services: [],

  // Получение профиля мастера
  fetchProfile: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', masterId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        set({ masterProfile: data as MasterProfile });
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля мастера:', err);
    }
  },

  // Обновление профиля мастера
  updateProfileInDB: async (updatedFields) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { error } = await supabase.from('profiles').update(updatedFields).eq('id', masterId);

      if (error) throw error;

      set((state) => ({
        masterProfile: state.masterProfile ? { ...state.masterProfile, ...updatedFields } : null,
      }));
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    }
  },

  // Получение списка услуг
  fetchServices: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { data, error } = await supabase.from('services').select('*').eq('master_id', masterId);

      if (error) throw error;
      if (data) {
        set({ services: data as Service[] });
      }
    } catch (e) {
      console.error('Ошибка загрузки услуг:', e);
    }
  },

  // Добавление новой услуги
  addService: async (service) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...service, master_id: masterId }])
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

  // Обновление услуги
  updateService: async (id, updatedService) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .update(updatedService)
        .eq('id', id)
        .eq('master_id', masterId)
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
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('master_id', masterId);

      if (error) throw error;

      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('Не удалось удалить услугу из Supabase:', err);
    }
  },
});
