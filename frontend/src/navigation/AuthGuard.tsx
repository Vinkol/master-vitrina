import React, { useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { RegistrationForm } from './RegistrationForm';
import { ClientRouter } from './ClientRouter';
import { AdminRouter } from './AdminRouter';
import { Loader } from '../shared/ui/loader/Loader';
import { getStartParam } from '../shared/lib/getStartParam';
import { useMasterProfile } from '../features/master/useMasterProfile';

export const AuthGuard: React.FC = () => {
  const initAuth = useBookingStore((state) => state.initAuth);
  const isAuthLoading = useBookingStore((state) => state.isLoading);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);
  const referralId = getStartParam();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const { isLoading: isProfileLoading } = useMasterProfile();

  if (isAuthLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  if (referralId) {
    return <ClientRouter />;
  }

  if (isAuthenticated) {
    if (isRegisteredMaster && isProfileLoading) {
      return <Loader text="Загрузка профиля мастера..." />;
    }

    const needsRegistration = !isRegisteredMaster;

    if (needsRegistration) {
      return <RegistrationForm />;
    }

    return <AdminRouter />;
  }

  return <ClientRouter />;
};
