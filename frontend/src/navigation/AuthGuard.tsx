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

  // 1. Пока бэкенд на FastAPI проверяет хэш и генерирует JWT — крутим красивый спиннер
  if (isLoading) {
    return <Loader text="Синхронизация с Telegram..." />;
  }

  // 2. Логика для КЛИЕНТА: если в ссылке есть start_param и он НЕ равен 'reg',
  // значит это клиент пришел на витрину к конкретному мастеру
  if (startParam && startParam !== 'reg') {
    return <ClientRouter />;
  }

  // 3. Логика для МАСТЕРА: если мастер авторизован, но у него в базе еще
  // нет заполненного имени или профиля (или расписания) — отправляем его заполнять анкету
  const hasNoProfile = !masterProfile || !masterProfile.name || masterProfile.name === 'Мастер';

  if (isAuthenticated && hasNoProfile) {
    return <RegistrationForm />;
  }

  // 4. Если мастер заполнил профиль — открываем полноценную панель управления (Админку)
  if (isAuthenticated) {
    return <AdminRouter />;
  }

  // Запасной вариант на случай сбоя авторизации — показываем дефолтный экран клиента
  return <ClientRouter />;
};
