import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState, MasterSlice, Service, MasterProfile } from './types';
import type { TelegramWebApp } from '../types/telegram';

export const createMasterSlice: StateCreator<BookingState, [], [], MasterSlice> = (set, get) => ({
  masterProfile: null,
  services: [],

  registerMaster: async (name, tgInstance) => {
    try {
      const { executeRegistrationInFunction } = get();

      if (typeof executeRegistrationInFunction === 'function') {
        const castedTg = tgInstance ? (tgInstance as unknown as TelegramWebApp) : null;
        await executeRegistrationInFunction(name, castedTg);
      } else {
        throw new Error('Метод не найден в глобальном сторе');
      }
    } catch (e) {
      console.error('Ошибка регистрации мастера:', e);
    }
  },

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
});
