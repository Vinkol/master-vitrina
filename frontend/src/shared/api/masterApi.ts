import type { CrmFilter } from '../../pages/admin-clients/useClientsCrm';
import type {
  MasterProfile,
  DaySchedule,
  Service,
  Appointment,
  CrmClient,
} from '../../store/types';
import { api } from './api';

interface FastAPIProfileResponse {
  telegram_id: number;
  name: string;
  bio: string | null;
  avatar: string | null;
  currency?: string;
  slot_step?: number;
  client_buffer?: number;
  master_buffer?: number;
}

interface FastAPIScheduleResponse {
  schedule: DaySchedule[];
}

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const getBaseUrl = () => (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// Получение профиля мастера
export async function getMasterProfileApi(
  masterId: string,
  token: string | null,
): Promise<MasterProfile> {
  const baseUrl = getBaseUrl();
  const profileRes = await fetch(`${baseUrl}/api/v1/master/profile`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!profileRes.ok) throw new Error('Не удалось загрузить данные профиля');

  const profileData = (await profileRes.json()) as FastAPIProfileResponse;
  const scheduleRes = await fetch(`${baseUrl}/api/v1/master/schedule`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  let rawSchedule: DaySchedule[] = [];
  if (scheduleRes.ok) {
    const scheduleData = (await scheduleRes.json()) as FastAPIScheduleResponse;
    if (Array.isArray(scheduleData.schedule)) {
      rawSchedule = scheduleData.schedule;
    }
  }
  return {
    id: masterId,
    telegram_id: profileData.telegram_id,
    name: profileData.name,
    bio: profileData.bio || '',
    avatar: profileData.avatar || '',
    schedule: rawSchedule,
    currency: profileData.currency || 'RUB',
    slot_step: profileData.slot_step,
    client_buffer: profileData.client_buffer,
    master_buffer: profileData.master_buffer,
  };
}

// Обновление профиля мастера
export async function updateMasterProfileApi(
  updatedFields: Partial<MasterProfile>,
  token: string | null,
): Promise<void> {
  const baseUrl = getBaseUrl();

  if (updatedFields.schedule !== undefined) {
    const response = await fetch(`${baseUrl}/api/v1/master/schedule`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updatedFields.schedule),
    });
    if (!response.ok) throw new Error('Бэкенд отклонил сохранение расписания');
  }

  if (
    updatedFields.name !== undefined ||
    updatedFields.bio !== undefined ||
    updatedFields.avatar !== undefined ||
    updatedFields.currency !== undefined ||
    updatedFields.slot_step !== undefined ||
    updatedFields.client_buffer !== undefined ||
    updatedFields.master_buffer !== undefined
  ) {
    const response = await fetch(`${baseUrl}/api/v1/master/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        name: updatedFields.name,
        bio: updatedFields.bio,
        avatar: updatedFields.avatar,
        currency: updatedFields.currency,
        slot_step: updatedFields.slot_step,
        client_buffer: updatedFields.client_buffer,
        master_buffer: updatedFields.master_buffer,
      }),
    });
    if (!response.ok) throw new Error('Бэкенд отклонил обновление данных профиля');
  }
}

// Получение списка услуг мастера
export async function getServicesApi(masterId: string): Promise<Service[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/services/master/${masterId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Ошибка загрузки списка услуг');
  return (await response.json()) as Service[];
}

// Добавление новой услуги
export async function addServiceApi(
  service: Omit<Service, 'id'>,
  token: string | null,
): Promise<Service> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/services`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(service),
  });
  if (!response.ok) throw new Error('Бэкенд не смог создать услугу');
  return (await response.json()) as Service;
}

// Обновление услуги
export async function updateServiceApi(
  id: string,
  updatedFields: Partial<Service>,
  token: string | null,
): Promise<Service> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/services/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updatedFields),
  });
  if (!response.ok) throw new Error('Бэкенд отклонил обновление услуги');
  return (await response.json()) as Service;
}

// Удаление услуги
export async function deleteServiceApi(id: string, token: string | null): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Бэкенд не разрешил удалить услугу');
}

//  Получение журнала записей мастера

interface FastAPIAppointmentResponse {
  id: string;
  master_tg_id: number;
  service_title: string;
  date: string;
  time: string;
  client_name: string;
  client_phone: string;
  duration: number;
  service_duration: number;
  master_id?: string;
}

export async function getAppointmentsApi(
  masterId: string,
  token: string | null,
): Promise<Appointment[]> {
  const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

  const response = await fetch(`${baseUrl}/api/v1/appointments/master/${masterId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Не удалось загрузить журнал записей');

  const data = (await response.json()) as FastAPIAppointmentResponse[];

  return data.map((app): Appointment => {
    const timeStr = app.time;
    const formattedTime = timeStr.length === 8 ? timeStr.substring(0, 5) : timeStr;

    return {
      id: app.id,
      master_tg_id: app.master_tg_id,
      service_title: app.service_title,
      date: app.date,
      time: formattedTime,
      client_name: app.client_name,
      client_phone: app.client_phone,
      duration: app.duration,
      service_duration: app.service_duration,
      master_id: app.master_id,
    };
  });
}

// Создание новой записи клиента
interface CreateAppointmentPayload {
  master_id: string;
  service_id: string;
  date: string;
  time: string;
  client_name: string;
  client_phone: string;
}

export async function createAppointmentApi(payload: CreateAppointmentPayload): Promise<void> {
  const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

  const response = await fetch(`${baseUrl}/api/v1/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 409) {
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp && typeof tgWebApp.showAlert === 'function') {
        tgWebApp.showAlert('⚠️ Это окошко уже успели занять! Выберите, пожалуйста, другое время.');
      }
      return;
    }
    throw new Error('Бэкенд отклонил создание записи');
  }
}

interface FetchCrmParams {
  masterId: string;
  search: string;
  filter: CrmFilter;
  page: number;
  size: number;
}

// 9. Чистый API-запрос на пагинацию списка клиентов
export async function getCrmClientsApi({
  masterId,
  search,
  filter,
  page,
  size,
}: FetchCrmParams): Promise<CrmClient[]> {
  const response = await api.get(`/api/v1/master/${masterId}/crm-clients`, {
    params: {
      search: search.trim() || undefined,
      filter,
      page,
      size,
    },
  });
  return (response.data as CrmClient[]) || [];
}

// 10. Чистый API-запрос на блокировку клиента
export async function blockClientApi(masterId: string, clientPhone: string): Promise<void> {
  await api.post('/api/v1/master/clients/block', {
    master_id: masterId,
    client_phone: clientPhone.trim(),
  });
}

// 11. Чистый API-запрос на разблокировку клиента
export async function unblockClientApi(masterId: string, clientPhone: string): Promise<void> {
  await api.post('/api/v1/master/clients/unblock', {
    master_id: masterId,
    client_phone: clientPhone.trim(),
  });
}
