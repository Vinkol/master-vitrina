import React, { useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { RegistrationForm } from './RegistrationForm';
import { ClientRouter } from './ClientRouter';
import { AdminRouter } from './AdminRouter';
import { Loader } from '../shared/ui/loader/Loader';
import { getStartParam } from '../shared/lib/getStartParam';

export const AuthGuard: React.FC = () => {
  const initAuth = useBookingStore((state) => state.initAuth);
  const isLoading = useBookingStore((state) => state.isLoading);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);

  const referralId = getStartParam();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  if (referralId) {
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
