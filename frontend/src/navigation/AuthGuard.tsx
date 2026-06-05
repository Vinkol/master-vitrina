import React, { useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { RegistrationForm } from './RegistrationForm';
import { ClientRouter } from './ClientRouter';
import { AdminRouter } from './AdminRouter';
import { Loader } from '../shared/ui/loader/Loader';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = () => {
  const initAuth = useBookingStore((state) => state.initAuth);
  const isLoading = useBookingStore((state) => state.isLoading);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const masterProfile = useBookingStore((state) => state.masterProfile);

  const tg = window.Telegram?.WebApp;
  const tgStartParam = tg?.initDataUnsafe?.start_param;

  const urlParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const browserStartParam = urlParams ? urlParams.get('startapp') : null;

  const effectiveMasterId = tgStartParam || browserStartParam;

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (effectiveMasterId && effectiveMasterId !== 'reg') {
    return <ClientRouter />;
  }

  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  if (isAuthenticated && !masterProfile) {
    return <Loader text="Загрузка профиля мастера..." />;
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
