import type { StateCreator } from 'zustand';
import type { BookingState, CrmClient, CrmSlice } from './types';
import { api } from '../shared/api/api';
import type { CrmFilter } from '../pages/admin-clients/useClientsCrm';

const PAGE_SIZE = 20;

export const createCrmSlice: StateCreator<BookingState, [], [], CrmSlice> = (set, get) => ({
  crmClients: [],
  hasMoreClients: true,
  crmSearchQuery: '',
  crmActiveFilter: 'all',
  crmCurrentPage: 0,

  fetchCrmClients: async (search = '', filter: CrmFilter = 'all', page = 0) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    set({
      crmSearchQuery: search,
      crmActiveFilter: filter,
      crmCurrentPage: page,
    });

    try {
      const response = await api.get(`/api/v1/master/${masterId}/crm-clients`, {
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
      set({
        crmClients: page === 0 ? [] : get().crmClients,
        hasMoreClients: false,
      });
    }
  },

  blockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      await api.post('/api/v1/master/clients/block', {
        master_id: masterId,
        client_phone: clientPhone.trim(),
      });

      const { crmSearchQuery, crmActiveFilter } = get();
      await get().fetchCrmClients(crmSearchQuery, crmActiveFilter, 0);
    } catch (e) {
      console.error('Не удалось заблокировать клиента на FastAPI:', e);
    }
  },

  unblockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      await api.post('/api/v1/master/clients/unblock', {
        master_id: masterId,
        client_phone: clientPhone.trim(),
      });

      const { crmSearchQuery, crmActiveFilter } = get();
      await get().fetchCrmClients(crmSearchQuery, crmActiveFilter, 0);
    } catch (e) {
      console.error('Не удалось разблокировать клиента на FastAPI:', e);
    }
  },
});
