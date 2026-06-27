import type { StateCreator } from 'zustand';
import type { BookingState, CrmSlice } from './types';

export const createCrmSlice: StateCreator<BookingState, [], [], CrmSlice> = (set) => ({
  crmClients: [],
  hasMoreClients: true,
  crmSearchQuery: '',
  crmActiveFilter: 'all',
  crmCurrentPage: 0,

  fetchCrmClients: async () => {},

  blockClient: (clientPhone) => {
    set((state) => ({
      crmClients: state.crmClients.map((c) =>
        c.client_phone === clientPhone ? { ...c, is_blocked: true } : c,
      ),
    }));
  },

  unblockClient: (clientPhone) => {
    set((state) => ({
      crmClients: state.crmClients.map((c) =>
        c.client_phone === clientPhone ? { ...c, is_blocked: false } : c,
      ),
    }));
  },
});
