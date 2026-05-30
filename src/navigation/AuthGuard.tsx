import React, { useState } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { Loader } from '../components/common/Loader';
import type { TelegramWebApp } from '../types/telegram';

interface AuthGuardProps {
  children: React.ReactNode;
  tg: TelegramWebApp | null;
}

export function AuthGuard({ children, tg }: AuthGuardProps) {
  const appStatus = useBookingStore((state) => state.appStatus);

  switch (appStatus) {
    case 'LOADING':
      return <Loader text="Синхронизация с облаком..." />;

    case 'REGISTRATION':
      return <RegistrationForm tg={tg} />;

    case 'UNAUTHORIZED':
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Авторизация отклонена</p>
            <p className="text-xs text-slate-400">
              Пожалуйста, перезапустите приложение внутри Telegram
            </p>
          </div>
        </div>
      );

    case 'AUTHORIZED':
    default:
      return <>{children}</>;
  }
}

interface RegistrationFormProps {
  tg: TelegramWebApp | null;
}

function RegistrationForm({ tg }: RegistrationFormProps) {
  const executeRegistration = useBookingStore((state) => state.executeRegistrationInFunction);

  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = businessName.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await executeRegistration(trimmedName, tg);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Не удалось создать профиль. Повторите попытку.');
      console.error('[REGISTRATION_UI_ERROR]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800 select-none animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-100 space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 to-violet-500" />

        <div className="w-14 h-14 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-xl border border-indigo-100/50 mt-2">
          👋
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black tracking-tight text-slate-800">Добро пожаловать!</h2>
          <p className="text-xs text-slate-400 leading-relaxed px-1">
            Вы вошли в систему первый раз. Введите название вашей студии или ваше имя, чтобы
            сгенерировать личную ссылку для записи.
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            Название витрины / Имя мастера
          </label>
          <input
            type="text"
            required
            autoFocus
            disabled={isSubmitting}
            placeholder="Например: Студия Beauty или Мастер Анна"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-sm transition-all focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-medium bg-rose-50/50 py-2 rounded-lg border border-rose-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !businessName.trim()}
          className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all active:scale-[0.98] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:pointer-events-none"
        >
          {isSubmitting ? 'Настройка рабочего места...' : 'Создать профиль →'}
        </button>
      </form>
    </div>
  );
}
