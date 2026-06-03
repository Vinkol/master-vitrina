import type { StateCreator } from 'zustand';
import type { BookingState, MasterSlice, Service, MasterProfile } from './types';

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const createMasterSlice: StateCreator<BookingState, [], [], MasterSlice> = (set, get) => ({
  masterProfile: null,
  services: [],

  // Получение профиля мастера
  fetchProfile: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;
      const response = await fetch(`${baseUrl}/api/v1/master/schedule`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error('Не удалось загрузить профиль мастера');
      const data = (await response.json()) as { schedule: Record<string, unknown>[] | null };

      // Собираем объект профиля для фронтенда
      const profile: MasterProfile = {
        id: masterId,
        telegram_id: 0, // Заглушка, если фронту не критично
        name: 'Мастер',
        schedule: data.schedule || [],
      } as unknown as MasterProfile;

      set({ masterProfile: profile });
    } catch (err) {
      console.error('Ошибка загрузки профиля мастера через FastAPI:', err);
    }
  },

  // Обновление профиля мастера (Хук useAdminHours вызывает именно этот метод!)
  updateProfileInDB: async (updatedFields) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;

      // Если фронтенд прислал расписание schedule, отправляем его на наш новый асинхронный эндпоинт
      if (updatedFields.schedule) {
        const response = await fetch(`${baseUrl}/api/v1/master/schedule`, {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(updatedFields.schedule), // Передаем чистый массив дней []
        });

        if (!response.ok) throw new Error('Бэкенд отклонил сохранение расписания');
      }

      // Обновляем состояние в памяти Zustand, чтобы календарь на экране мгновенно перерисовался
      set((state) => ({
        masterProfile: state.masterProfile ? { ...state.masterProfile, ...updatedFields } : null,
      }));
    } catch (err) {
      console.error('Ошибка обновления профиля через FastAPI:', err);
    }
  },

  // Получение списка услуг
  fetchServices: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

      // Наш GET-роутер услуг /master/{master_id} доступен без токена (чтобы клиенты видели прайс)
      const response = await fetch(`${baseUrl}/api/v1/services/master/${masterId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Ошибка загрузки списка услуг');
      const data = (await response.json()) as Service[];

      set({ services: data });
    } catch (e) {
      console.error('Ошибка загрузки услуг через FastAPI:', e);
    }
  },

  // Добавление новой услуги
  addService: async (service) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;

      const response = await fetch(`${baseUrl}/api/v1/services`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          title: service.title,
          description: service.description,
          price: service.price,
          duration: service.duration,
        }),
      });

      if (!response.ok) throw new Error('Бэкенд не смог создать услугу');
      const newService = (await response.json()) as Service;

      set((state) => ({ services: [...state.services, newService] }));
    } catch (err) {
      console.error('Ошибка сохранения услуги через FastAPI:', err);
    }
  },

  // Обновление услуги (Наш добавленный эндпоинт PATCH!)
  updateService: async (id, updatedService) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;

      const response = await fetch(`${baseUrl}/api/v1/services/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updatedService),
      });

      if (!response.ok) throw new Error('Бэкенд отклонил обновление услуги');
      const updated = (await response.json()) as Service;

      set((state) => ({
        services: state.services.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (err) {
      console.error('Не удалось обновить услугу через FastAPI:', err);
    }
  },

  // Удаление услуги
  deleteService: async (id) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;

      const response = await fetch(`${baseUrl}/api/v1/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error('Бэкенд не разрешил удалить услугу');

      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('Не удалось удалить услугу через FastAPI:', err);
    }
  },
});
