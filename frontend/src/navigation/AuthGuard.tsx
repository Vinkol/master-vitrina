import React, { useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { RegistrationForm } from './RegistrationForm';
import { ClientRouter } from './ClientRouter';
import { AdminRouter } from './AdminRouter';
import { Loader } from '../shared/ui/loader/Loader';

export const AuthGuard: React.FC = () => {
  const initAuth = useBookingStore((state) => state.initAuth);
  const isLoading = useBookingStore((state) => state.isLoading);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);

  const tg = window.Telegram?.WebApp;
  const tgStartParam = tg?.initDataUnsafe?.start_param;

  const urlParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const browserStartParam = urlParams ? urlParams.get('startapp') : null;
  const referralId = tgStartParam || browserStartParam;

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
    if (!isRegisteredMaster || hasNoProfile) {
      return <RegistrationForm />;
    }

    return <AdminRouter />;
  }

  return <ClientRouter />;
};
