import React, { useState } from 'react';
import { Button } from './Button';
import { validateTelegramUsername } from '../utils/validators';
import { createBetaLead } from '../services/api';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
}

export function PricingModal({ isOpen, onClose, selectedPlan }: PricingModalProps) {
  const [tgUsername, setTgUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedUsername = tgUsername.trim();
    const validation = validateTelegramUsername(trimmedUsername);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createBetaLead({
        tg_username: trimmedUsername,
        plan_name: selectedPlan,
      });

      console.log(`Валидная заявка отправлена: Тариф "${selectedPlan}", TG: @${trimmedUsername}`);
      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось отправить заявку. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[@\s]/g, '');
    setTgUsername(value);

    if (value.length === 0) {
      setError('');
    } else {
      const validation = validateTelegramUsername(value);
      setError(validation.error);
    }
  };

  const handleClose = () => {
    setTgUsername('');
    setError('');
    setIsSubmitted(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Контент модалки */}
      <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-2xl duration-200 lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 cursor-pointer p-1 text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>

        {!isSubmitted ? (
          <>
            <span className="rounded bg-indigo-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-indigo-600 uppercase dark:bg-indigo-950/40 dark:text-indigo-400">
              Закрытый тест • Тариф {selectedPlan}
            </span>
            <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Станьте первыми с PRO-возможностями
            </h3>
            <p className="mt-2 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
              Этот функционал сейчас на финальной стадии разработки. Оставьте свой Telegram, и мы
              подключим вам его бесплатно или с максимальной скидкой сразу после релиза!
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Ваш Telegram никнейм
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={tgUsername}
                    onChange={handleInputChange}
                    placeholder="username"
                    className={`w-full rounded-xl border bg-slate-50 py-3 pr-4 pl-8 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-colors focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                      error
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:border-indigo-500 dark:border-slate-800/80'
                    }`}
                  />
                </div>
                {error && (
                  <p className="animate-in fade-in slide-in-from-top-1 mt-1.5 pl-1 text-[11px] font-bold text-rose-500 duration-150">
                    {error}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  variant="popular"
                  type="submit"
                  disabled={!!error || !tgUsername || isLoading}
                  className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Отправка...' : 'Подать заявку'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-black text-emerald-600 dark:text-emerald-400">
              ✓
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Заявка принята!
            </h3>
            <p className="mt-2 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
              Мы сохранили ваш профиль{' '}
              <span className="font-bold text-indigo-500">@{tgUsername}</span>. Как только тариф{' '}
              <span className="font-bold">{selectedPlan}</span> станет доступен, наш бот пришлет вам
              персональное приглашение.
            </p>
            <div className="mt-6">
              <Button variant="secondary" onClick={handleClose} className="w-full cursor-pointer">
                Отлично
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
