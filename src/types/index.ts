// Данные пользователя Telegram
export interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Тип для нативной кнопки Telegram
export interface TelegramMainButton {
  text: string;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

// Нативные методы Telegram SDK
export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  showAlert: (message: string) => void;
  initDataUnsafe?: {
    user?: WebAppUser;
    start_param?: string;
  };
  MainButton: TelegramMainButton;
}

// Сущность Услуги мастера
export interface Service {
  id: string;
  title: string;
  duration: number;
  price: number;
  description?: string;
}

// Сущность Записи клиента
export interface Appointment {
  id: string;
  serviceId: string;
  date: string; // Формат "YYYY-MM-DD"
  timeSlot: string; // Формат "HH:MM"
  clientName: string;
  clientPhone: string;
}

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

// Сущность Профиля Мастера
export interface MasterProfile {
  name: string;
  bio: string;
  avatar: string;
  owner_tg_id?: number;
  schedule: DaySchedule[];
}

// Сущность Настроек Рабочих Часов
export interface WorkingHours {
  start: string;
  end: string;
}
