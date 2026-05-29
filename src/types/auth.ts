import type { MasterProfile } from './index';

export type AppStatus = 'LOADING' | 'UNAUTHORIZED' | 'REGISTRATION' | 'AUTHORIZED';

export type UserRole = 'master' | 'client';

export interface AuthSuccessPayload {
  registered: true;
  role: UserRole;
  token: string;
  masterProfile?: MasterProfile[];
}

export interface AuthNewUserPayload {
  registered: false;
  telegramId: number;
}

export type AuthResponse = AuthSuccessPayload | AuthNewUserPayload;
