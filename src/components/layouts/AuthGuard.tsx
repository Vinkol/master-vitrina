import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import type { TelegramWebApp } from '../../types';

interface AuthGuardProps {
  children: React.ReactNode;
  tg: TelegramWebApp | null;
}

export function AuthGuard({ children, tg }: AuthGuardProps) {
  const { isRegistered, masterProfile, registerMaster } = useBookingStore();
  const [newMasterName, setNewMasterName] = useState('');

  // 1. Слой загрузки: ждем ответа от Supabase
  if (masterProfile === null && isRegistered === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 font-mono tracking-widest uppercase animate-pulse">
        Поиск мастера в облаке...
      </div>
    );
  }

  // 2. Слой регистрации: если мастера нет в БД
  if (!isRegistered) {
    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedName = newMasterName.trim();
      if (!trimmedName) return;
      registerMaster(trimmedName, tg ?? undefined);
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
              placeholder="Например: Мастер Елена, Студия красоты"
              value={newMasterName}
              onChange={(e) => setNewMasterName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm active:scale-[0.99]"
          >
            Создать профиль мастера →
          </button>
        </form>
      </div>
    );
  }

  // 3. Проверка пройдена — рендерим основное приложение
  return <>{children}</>;
}
