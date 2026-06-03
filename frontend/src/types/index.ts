// Таблица profiles
export interface MasterProfile {
  id: string; // uuid (Primary Key)
  telegram_id: number;
  owner_tg_id: number; // int8 (Ваш главный ключ связи по TG)
  name: string; // text
  bio: string; // text
  avatar: string; // text
  schedule: DaySchedule[]; // jsonb (Массив расписания дней)
}

// Таблица пользователя
export interface UserProfile {
  id: string;
  telegram_id: number | null;
  username: string | null;
  full_name: string | null;
  role: 'client' | 'master';
  business_name: string | null;
}

// Таблица services
export interface Service {
  id: string; // uuid (Primary Key)
  master_tg_id: number; // int8 (Связь с profiles.owner_tg_id)
  title: string; // text
  description: string; // text
  price: number; // int8
  duration: number; // int8
  master_id?: string; // uuid
}

// Таблица appointments
export interface Appointment {
  id: string; // uuid (Primary Key)
  master_tg_id: number; // int8 (Связь с profiles.owner_tg_id)
  service_title: string; // text
  date: string; // text ("YYYY-MM-DD")
  time: string; // text ("HH:MM")
  client_name: string; // text
  master_id?: string; // uuid
  client_phone: string; // text
  duration: number;
}

// ВСПОМОГАТЕЛЬНЫЕ И СИСТЕМНЫЕ ТИПЫ фронтенда
export interface TimeInterval {
  id: string;
  start: string;
  end: string;
}

export interface DaySchedule {
  day_index: number;
  is_working: boolean;
  working_start: string;
  working_end: string;
  breaks: TimeInterval[];
}

export interface CalendarDay {
  dayOfWeek: string;
  dayOfMonth: number;
  monthLabel: string;
  isoDate: string;
}

// Данные заблокированного клиента
export interface BlockedClient {
  id: string;
  master_tg_id: number;
  client_name: string;
}

// Тип клиента
export interface CrmClient {
  master_tg_id: number;
  client_name: string;
  client_phone: string;
  visits_count: number;
  last_visit_date: string;
  has_future_appointment: boolean;
  is_blocked: boolean;
}

// Системные интерфейсы Telegram SDK
export interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramMainButton {
  text: string;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}
