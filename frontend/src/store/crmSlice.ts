import type { StateCreator } from 'zustand';
import type { BookingState, CrmClient, CrmSlice } from './types';
import { api } from '../shared/api/api';

const PAGE_SIZE = 20;

export const createCrmSlice: StateCreator<BookingState, [], [], CrmSlice> = (set, get) => ({
  crmClients: [],
  hasMoreClients: true,

  fetchCrmClients: async (search = '', filter = 'all', page = 0) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const response = await api.get(`/master/${masterId}/crm-clients`, {
        params: {
          search: search.trim() || undefined,
          filter,
          page,
          size: PAGE_SIZE,
        },
      });

      const rawClients = (response.data as CrmClient[]) || [];

      set({
        crmClients: page === 0 ? rawClients : [...get().crmClients, ...rawClients],
        hasMoreClients: rawClients.length === PAGE_SIZE,
      });
    } catch (e) {
      console.error('Ошибка серверной CRM-пагинации на FastAPI:', e);
    }
  },

  blockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      await api.post('/master/clients/block', {
        master_id: masterId,
        client_phone: clientPhone.trim(),
      });

      await get().fetchCrmClients();
    } catch (e) {
      console.error('Не удалось заблокировать клиента на FastAPI:', e);
    }
  },

  unblockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      await api.post('/master/clients/unblock', {
        master_id: masterId,
        client_phone: clientPhone.trim(),
      });

      await get().fetchCrmClients();
    } catch (e) {
      console.error('Не удалось разблокировать клиента на FastAPI:', e);
    }
  },
});
