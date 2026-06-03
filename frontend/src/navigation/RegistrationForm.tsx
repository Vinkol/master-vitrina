import React, { useState, useEffect } from 'react';
import { useBookingStore } from '../store/useBookingStore';

export const RegistrationForm: React.FC = () => {
  const registerMaster = useBookingStore((state) => state.registerMaster);
  const isLoading = useBookingStore((state) => state.isLoading);

  // Локальный стейт формы
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  // Автоопределение таймзоны пользователя (например, 'Europe/Moscow', 'Asia/Tashkent')
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const tg = window.Telegram?.WebApp;

  // Интеграция с нативной кнопкой Telegram MainButton
  useEffect(() => {
    if (!tg) return;

    // Настраиваем кнопку под дизайн формы
    tg.MainButton.setText('СОЗДАТЬ ПРОФИЛЬ МАСТЕРА');
    tg.MainButton.setParams({
      text_color: '#ffffff',
    });

    // Показываем кнопку только если введено имя
    if (name.trim().length >= 2 && !isLoading) {
      tg.MainButton.show();
      tg.MainButton.enable();
    } else {
      tg.MainButton.hide();
    }

    // Обработчик клика по нативной кнопке
    const handleMainButtonClick = async () => {
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      tg.MainButton.showProgress(); // Показываем лоадер внутри кнопки Telegram

      const success = await registerMaster({ name: name.trim(), bio: bio.trim() });

      if (!success) {
        tg.MainButton.hideProgress();
        if (tg.showAlert) tg.showAlert('Не удалось зарегистрироваться. Попробуйте позже.');
      }
    };

    tg.MainButton.onClick(handleMainButtonClick);

    // Чистим за собой обработчики при размонтировании компонента
    return () => {
      tg.MainButton.offClick(handleMainButtonClick);
      tg.MainButton.hide();
    };
  }, [name, bio, isLoading, registerMaster, tg]);

  // Веб-фолбэк обработчик, если запустили вне Telegram (для тестов в браузере)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || isLoading) return;
    await registerMaster({ name: name.trim(), bio: bio.trim() });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 px-4 pt-4 pb-8 text-slate-100 font-sans select-none antialiased">
      {/* Карточка-контейнер с мягким размытием заднего плана */}
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto bg-slate-900/40 border border-slate-900/80 rounded-3xl p-5 backdrop-blur-md shadow-2xl">
        {/* Шапка формы */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl animate-pulse">✨</span>
            <h1 className="text-xl font-black tracking-tight bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase">
              Стать мастером
            </h1>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed">
            Создайте персональную витрину услуг. Настраивайте прайс-лист, расписание и делитесь
            ссылкой для мгновенной записи клиентов.
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between space-y-5">
          <div className="space-y-5">
            {/* Инпут имени */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  Имя или Бренд студии
                </label>
                <span className="text-[10px] font-bold text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/10">
                  Обязательно *
                </span>
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Анна Стрижки или Студия TopБрови"
                className="w-full rounded-2xl bg-slate-900 border border-slate-800/80 p-3.5 text-sm text-slate-100 placeholder-slate-500/70 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none disabled:opacity-40"
              />
            </div>

            {/* Инпут описания */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 font-mono">
                О себе / Описание услуг
              </label>
              <textarea
                disabled={isLoading}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите клиентам о вашем опыте, материалах, парковке или важных правилах отмены записей..."
                rows={4}
                className="w-full resize-none rounded-2xl bg-slate-900 border border-slate-800/80 p-3.5 text-sm text-slate-100 placeholder-slate-500/70 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none disabled:opacity-40"
              />
            </div>

            {/* Отображение таймзоны (Информативно) */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-3.5 flex items-center justify-between transition-all duration-200 hover:border-slate-800">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">
                  Рабочий часовой пояс
                </p>
                <p className="text-xs font-bold text-slate-300 flex items-center">
                  <span className="mr-1.5 text-indigo-400">🌐</span> {timezone}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20 shadow-sm animate-pulse">
                Авто
              </span>
            </div>
          </div>

          {/* Фолбэк кнопка для дебага в обычном браузере (Полностью скрыта внутри Telegram) */}
          {!tg && (
            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={name.trim().length < 2 || isLoading}
                className="w-full rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
              >
                {isLoading ? 'Создание личного кабинета...' : 'Создать профиль мастера'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
