import type { StateCreator } from 'zustand';
import { supabase } from '../../supabaseClient';
import type { BookingState, CrmSlice } from './types';

const PAGE_SIZE = 20;

export const createCrmSlice: StateCreator<BookingState, [], [], CrmSlice> = (set, get) => ({
  crmClients: [],
  hasMoreClients: true,

  fetchCrmClients: async (search = '', filter = 'all', page = 0) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data: blockedData } = await supabase
        .from('blocked_clients')
        .select('client_phone')
        .eq('master_id', masterId);

      const blockedPhones = (blockedData || []).map((b) => b.client_phone.trim());

      let query = supabase.from('master_clients_view').select('*').eq('master_id', masterId);

      if (search) {
        query = query.or(`client_name.ilike.%${search}%,client_phone.ilike.%${search}%`);
      }

      if (filter === 'new') {
        query = query.eq('visits_count', 1);
      } else if (filter === 'loyal') {
        query = query.gte('visits_count', 3);
      } else if (filter === 'active') {
        query = query.eq('has_future_appointment', true);
      }

      const { data: rawClients, error } = await query
        .order('visits_count', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mappedClients = (rawClients || []).map((client) => {
        const currentPhone = (client.client_phone || '').trim();
        const isBlocked = blockedPhones.includes(currentPhone);
        return {
          ...client,
          client_phone: client.client_phone || 'Телефон не указан',
          visits_count: Number(client.visits_count),
          is_blocked: isBlocked,
        };
      });

      let finalClients = mappedClients;
      if (filter === 'blocked') {
        finalClients = mappedClients.filter((c) => c.is_blocked);
      } else if (filter !== 'all') {
        finalClients = mappedClients.filter((c) => !c.is_blocked);
      }

      set({
        crmClients: page === 0 ? finalClients : [...get().crmClients, ...finalClients],
        hasMoreClients: (rawClients || []).length === PAGE_SIZE,
      });
    } catch (e) {
      console.error('Ошибка серверной CRM-пагинации:', e);
    }
  },

  blockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { error } = await supabase
        .from('blocked_clients')
        .insert([{ master_id: masterId, client_phone: clientPhone.trim() }]);

      if (error) throw error;
      await get().fetchCrmClients();
    } catch (e) {
      console.error('Не удалось заблокировать клиента:', e);
    }
  },

  unblockClient: async (clientPhone) => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const { error } = await supabase
        .from('blocked_clients')
        .delete()
        .eq('master_id', masterId)
        .eq('client_phone', clientPhone.trim());

      if (error) throw error;
      await get().fetchCrmClients();
    } catch (e) {
      console.error('Не удалось разблокировать клиента:', e);
    }
  },
});
