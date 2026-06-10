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
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);

  const tg = window.Telegram?.WebApp;
  const referralId = tg?.initDataUnsafe?.start_param;

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  const isOwnLink = masterProfile && masterProfile.id === referralId;
  if (referralId && !isOwnLink) {
    return <ClientRouter />;
  }

  if (isAuthenticated) {
    if (isRegisteredMaster && !masterProfile) {
      return <Loader text="Загрузка профиля мастера..." />;
    }

    const hasNoProfile = !masterProfile || !masterProfile.name || masterProfile.name === 'Мастер';
    const needsRegistration = !isRegisteredMaster || hasNoProfile;

    if (needsRegistration) {
      return <RegistrationForm />;
    }

    return <AdminRouter />;
  }

  return <ClientRouter />;
};
