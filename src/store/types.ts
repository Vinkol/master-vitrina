import type { Service, MasterProfile, DaySchedule, Appointment, CrmClient } from '../types';
import type { AuthSliceState } from './authSlice';

export type Screen =
  | 'profile'
  | 'calendar'
  | 'admin-dashboard'
  | 'admin-services'
  | 'admin-profile-edit'
  | 'admin-hours-edit'
  | 'admin-link-share'
  | 'admin-placeholder-main'
  | 'admin-placeholder-clients';

export type Role = 'client' | 'master';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramInstance {
  initDataUnsafe?: {
    user?: TelegramUser;
    start_param?: string;
  };
}

export interface CrmSlice {
  crmClients: CrmClient[];
  hasMoreClients: boolean;
  fetchCrmClients: (search?: string, filter?: string, page?: number) => Promise<void>;
  blockClient: (clientName: string) => Promise<void>;
  unblockClient: (clientName: string) => Promise<void>;
}

export interface MasterSlice {
  masterProfile: MasterProfile | null;
  services: Service[];
  fetchProfile: () => Promise<void>;
  updateProfileInDB: (updatedFields: Partial<MasterProfile>) => Promise<void>;
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'master_tg_id'>) => Promise<void>;
  updateService: (id: string, updatedService: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  registerMaster: (name: string, tgInstance: TelegramInstance | undefined) => Promise<void>;
}

export interface BookingSlice {
  currentRole: Role;
  currentScreen: Screen;
  setRole: (role: Role) => void;
  setScreen: (screen: Screen) => void;
  appointments: Appointment[];
  fetchAppointments: () => Promise<void>;
  createAppointment: (clientName: string) => Promise<void>;
  currentMasterId: number | null;
  isOwner: boolean;
  botUsername: string;
  botAppName: string;
  isRegistered: boolean | null;
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  selectService: (service: Service) => void;
  setDate: (date: string) => void;
  setTime: (slot: string) => void;
  resetBooking: () => void;
  fetchMasterData: (tgInstance: TelegramInstance | undefined) => Promise<void>;
}

export type BookingState = CrmSlice & MasterSlice & BookingSlice & AuthSliceState;
export type { DaySchedule, Service, MasterProfile, Appointment, CrmClient };
