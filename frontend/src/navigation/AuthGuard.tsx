import React, { useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { RegistrationForm } from './RegistrationForm';
import { ClientRouter } from './ClientRouter';
import { AdminRouter } from './AdminRouter';
import { Loader } from '../components/common/Loader';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = () => {
  const initAuth = useBookingStore((state) => state.initAuth);
  const isLoading = useBookingStore((state) => state.isLoading);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const tg = window.Telegram?.WebApp;
  const startParam = tg?.initDataUnsafe?.start_param;

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }
  if (isAuthenticated && !masterProfile) {
    return <Loader text="Загрузка профиля мастера..." />;
  }
  if (startParam && startParam !== 'reg') {
    return <ClientRouter />;
  }
  const hasNoProfile = !masterProfile || !masterProfile.name || masterProfile.name === 'Мастер';
  if (isAuthenticated && hasNoProfile) {
    return <RegistrationForm />;
  }
  if (isAuthenticated) {
    return <AdminRouter />;
  }

  return <ClientRouter />;
};
