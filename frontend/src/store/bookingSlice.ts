import type { StateCreator } from 'zustand';
import type { BookingState, BookingSlice, Appointment } from './types';

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ИСПРАВЛЕНО: Указали BookingState в качестве итогового типа, чтобы линтер видел методы всех соседних слайсов
export const createBookingSlice: StateCreator<BookingState, [], [], BookingSlice> = (set, get) => ({
  currentRole: 'client',
  currentScreen: 'profile',
  appointments: [],
  currentMasterId: null,
  botUsername: 'mastervitrinabot',
  botAppName: 'app',
  isRegistered: null,
  isOwner: false,

  selectedService: null,
  selectedDate: '',
  selectedTime: '',

  setRole: (role) =>
    set({
      currentRole: role,
      currentScreen: role === 'master' ? 'admin-placeholder-main' : 'profile',
    }),

  setScreen: (screen) => set({ currentScreen: screen }),

  // Получение списка всех записей для журнала мастера (из нашей новой таблицы 'client')
  fetchAppointments: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const token = get().accessToken;
      const response = await fetch(`${baseUrl}/api/v1/appointments/master/${masterId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error('Не удалось загрузить журнал записей');
      const data = (await response.json()) as Record<string, unknown>[];

      // Приводим время формата "14:00:00" из Postgres к красивому "14:00" для React
      const formattedAppointments = data.map((app) => {
        const timeStr = typeof app.time === 'string' ? app.time : '';
        return {
          ...app,
          time: timeStr.length === 8 ? timeStr.substring(0, 5) : timeStr,
        } as unknown as Appointment;
      });

      set({ appointments: formattedAppointments });
    } catch (e) {
      console.error('Ошибка получения записей через FastAPI:', e);
    }
  },

  // Создание записи клиентом (Отправка POST на наш новый бэкенд)
  createAppointment: async (clientName) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const tgInstance = window.Telegram?.WebApp;
      const clientUsername = tgInstance?.initDataUnsafe?.user?.username
        ? `@${tgInstance.initDataUnsafe.user.username}`
        : 'Через ТГ по ссылке';

      const newAppointmentPayload = {
        master_id: currentMasterId,
        service_title: selectedService.title,
        date: selectedDate.split('T')[0],
        time: selectedTime,
        client_name: clientName,
        client_phone: clientUsername,
      };

      const response = await fetch(`${baseUrl}/api/v1/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointmentPayload),
      });

      if (!response.ok) {
        if (response.status === 409) {
          if (tgInstance && typeof tgInstance.showAlert === 'function') {
            tgInstance.showAlert(
              '⚠️ Это окошко уже успели занять! Выберите, пожалуйста, другое время.',
            );
          }
          return;
        }
        throw new Error('Бэкенд отклонил создание записи');
      }

      await get().fetchAppointments();
      get().resetBooking();
    } catch (e) {
      console.error('Ошибка создания записи через FastAPI:', e);
    }
  },

  // Загрузка первичных данных при открытии витрины мастера
  fetchMasterData: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      set({ isRegistered: true });
      await Promise.all([get().fetchProfile(), get().fetchServices(), get().fetchAppointments()]);
    } catch (e) {
      console.error('Ошибка при загрузке данных мастера для витрины:', e);
    }
  },

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),
  resetBooking: () =>
    set({ currentScreen: 'profile', selectedService: null, selectedDate: '', selectedTime: '' }),
});
