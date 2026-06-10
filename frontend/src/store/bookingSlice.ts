import type { StateCreator } from 'zustand';
import type { BookingState, BookingSlice, Appointment, MasterProfile, Service } from './types';

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const tgInstance = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
const tgStartParam = tgInstance?.initDataUnsafe?.start_param;

const urlParams =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const browserStartParam = urlParams ? urlParams.get('startapp') : null;

const finalMasterId = tgStartParam || browserStartParam;

export const createBookingSlice: StateCreator<BookingState, [], [], BookingSlice> = (set, get) => ({
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

  createAppointment: async (clientName, clientPhone) => {
    const { selectedService, selectedDate, selectedTime, currentMasterId } = get();
    if (!selectedService || !selectedDate || !selectedTime || !currentMasterId) return;

    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      const tgInstance = window.Telegram?.WebApp;

      const newAppointmentPayload = {
        master_id: currentMasterId,
        service_id: selectedService.id,
        date: selectedDate.split('T')[0],
        time: selectedTime,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
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
      throw e;
    }
  },

  fetchMasterData: async () => {
    const masterId = get().currentMasterId;
    if (!masterId) return;

    try {
      set({ isRegistered: true });
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
      if (!get().isRegisteredMaster) {
        console.log('Загрузка данных мастера через ПУБЛИЧНЫЕ эндпоинты для клиента...');
        const [profileRes, servicesRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/master/public/master/${masterId}`, { method: 'GET' }),
          fetch(`${baseUrl}/api/v1/master/public/master/${masterId}/services`, { method: 'GET' }),
          get().fetchAppointments(),
        ]);

        if (!profileRes.ok) throw new Error('Не удалось загрузить публичный профиль мастера');
        if (!servicesRes.ok) throw new Error('Не удалось загрузить публичные услуги мастера');

        const masterProfileData = (await profileRes.json()) as MasterProfile;
        const servicesData = (await servicesRes.json()) as Service[];
        set({
          masterProfile: masterProfileData,
          services: servicesData,
        });
      } else {
        await Promise.all([get().fetchProfile(), get().fetchServices(), get().fetchAppointments()]);
      }
    } catch (e) {
      console.error('Ошибка при загрузке данных мастера для витрины:', e);
    }
  },

  selectService: (service) => set({ selectedService: service, currentScreen: 'calendar' }),
  goToConfirm: () => set({ currentScreen: 'booking-confirm' }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (slot) => set({ selectedTime: slot }),
  resetBooking: () =>
    set({ currentScreen: 'profile', selectedService: null, selectedDate: '', selectedTime: '' }),
});
