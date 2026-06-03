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
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);
  const currentMasterId = useBookingStore((state) => state.currentMasterId);

  const tg = window.Telegram?.WebApp;
  const startParam = tg?.initDataUnsafe?.start_param;

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  if (!isRegisteredMaster) {
    return <RegistrationForm />;
  }

  if (startParam && startParam !== 'reg' && startParam === currentMasterId) {
    return <ClientRouter />;
  }

  if (isAuthenticated && isRegisteredMaster) {
    return <AdminRouter />;
  }

  return <ClientRouter />;
};
