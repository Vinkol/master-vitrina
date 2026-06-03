import type { Service, MasterProfile, DaySchedule, Appointment, CrmClient } from '../types';

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

export type Role = 'master' | 'client';

export interface RegisterMasterPayload {
  name: string;
  bio?: string;
}

export interface UserProfile {
  id: string;
  telegram_id: number | null;
  username: string | null;
  full_name: string | null;
  role: Role;
  business_name: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
}

export interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRegisteredMaster: boolean;
  botUsername: string;
  botAppName: string;
  currentMasterId: string | null;
  initAuth: () => Promise<void>;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramInstance {
  initData: string;
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: {
    user?: TelegramUser;
    start_param?: string;
  };
}

// export interface AuthSliceState {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   profile: UserProfile | null;
//   isTelegramEnv: boolean;
//   error: string | null;
//   initializeAuth: () => Promise<void>;
//   loginWithWebLink: () => Promise<string | null>;
//   logout: () => Promise<void>;
// }

export interface CrmSlice {
  crmClients: CrmClient[];
  hasMoreClients: boolean;
  fetchCrmClients: (search?: string, filter?: string, page?: number) => Promise<void>;
  blockClient: (clientPhone: string) => Promise<void>;
  unblockClient: (clientPhone: string) => Promise<void>;
}

export interface MasterSlice {
  masterProfile: MasterProfile | null;
  services: Service[];
  fetchProfile: () => Promise<void>;
  updateProfileInDB: (updatedFields: Partial<MasterProfile>) => Promise<void>;
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updatedService: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

export interface BookingSlice {
  currentRole: Role;
  currentScreen: Screen;
  setRole: (role: Role) => void;
  setScreen: (screen: Screen) => void;
  appointments: Appointment[];
  fetchAppointments: () => Promise<void>;
  createAppointment: (clientName: string) => Promise<void>;
  currentMasterId: string | null;
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
  fetchMasterData: () => Promise<void>;
}

export type BookingState = CrmSlice & MasterSlice & BookingSlice & AuthState;
export type { DaySchedule, Service, MasterProfile, Appointment, CrmClient };
