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
    start_param?: string; // ← Добавили параметр для мультимастера
  };
  MainButton: TelegramMainButton;
}

// Сущность Услуги мастера
export interface Service {
  id: string;
  title: string;
  duration: number; // в минутах
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

// Сущность Профиля Мастера
export interface MasterProfile {
  name: string;
  bio: string;
  avatar: string;
  working_start: string;
  working_end: string;
  owner_tg_id?: number;
}

// Сущность Настроек Рабочих Часов
export interface WorkingHours {
  start: string;
  end: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp & {
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}
