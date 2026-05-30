// src/navigation/AuthGuard.tsx
import React, { useState } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { Loader } from '../components/common/Loader';

interface AuthGuardProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tg: any;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isRegistered = useBookingStore((state) => state.isRegistered);

  // Слой загрузки: ждем ответа от базы данных
  if (isRegistered === null) {
    return <Loader text="Поиск мастера в облаке..." />;
  }

  // Слой регистрации: если мастера нет в БД
  if (isRegistered === false) {
    return <RegistrationForm />;
  }
  return <>{children}</>;
}

/* ИЗОЛИРОВАННАЯ ФОРМА РЕГИСТРАЦИИ */
function RegistrationForm() {
  const registerMaster = useBookingStore((state) => state.registerMaster);
  const [newMasterName, setNewMasterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = newMasterName.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await registerMaster(trimmedName, undefined);
    } catch (error) {
      console.error('Ошибка при регистрации мастера:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800 select-none">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-100 space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 to-purple-500" />
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-2xl border border-indigo-100 mt-2">
          🚀
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Создать Свою Витрину</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed px-2">
            Вы вошли в систему первый раз. Введите название вашей студии или ваше имя, чтобы
            сгенерировать личную ссылку для записи.
          </p>
        </div>

        <div className="text-left space-y-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Название бизнеса:
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            placeholder="Например: Мастер Елена, Студия красоты"
            value={newMasterName}
            onChange={(e) => setNewMasterName(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-semibold disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm active:scale-[0.99] ${
            isSubmitting
              ? 'bg-indigo-400 cursor-not-allowed shadow-none animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
          }`}
        >
          {isSubmitting ? 'Создание профиля...' : 'Создать профиль мастера →'}
        </button>
      </form>
    </div>
  );
}
