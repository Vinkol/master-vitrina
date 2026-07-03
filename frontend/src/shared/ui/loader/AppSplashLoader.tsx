import { useEffect, useState } from 'react';

interface AppSplashLoaderProps {
  text?: string;
}

const WAITING_HINTS = [
  'Пробуждаем сервер базы данных...',
  'Запускаем безопасное облачное окружение...',
  'Синхронизируем расписание мастеров...',
  'Загружаем актуальный прайс-лист...',
  'Почти готово, настраиваем витрину...',
];

export function AppSplashLoader({ text }: AppSplashLoaderProps) {
  const [hintIndex, setHintIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % WAITING_HINTS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(timer);
          return 94;
        }
        const remaining = 100 - prev;
        const step = Math.max(1, Math.floor(Math.random() * (remaining * 0.15)));
        return prev + step;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* ФОНОВАЯ СЕТКА */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      {/* ФОН */}
      {/* Первая сфера */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full mix-blend-screen will-change-transform animate-float-slow" />
      {/* Вторая сфера */}
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-fuchsia-600/15 rounded-full mix-blend-screen will-change-transform animate-float-delayed" />

      {/* ЦЕНТРАЛЬНЫЙ БЛОК */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
        {/* спиннер */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Внешнее кольцо */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-fuchsia-500 animate-spin duration-1000" />

          {/* Внутреннее кольцо */}
          <div className="absolute w-16 h-16 rounded-full border border-transparent border-b-fuchsia-400 border-l-cyan-400 animate-reverse-spin" />

          {/* ядро */}
          <div className="absolute w-7 h-7 rounded-full bg-linear-to-tr from-indigo-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.7)] animate-ping duration-2000" />
          <div className="absolute text-lg animate-pulse">✨</div>
        </div>

        {/* СЕКЦИЯ ПРОГРЕССА */}
        <div className="w-full mt-10 space-y-2">
          <div className="flex justify-evenly items-center px-1 font-mono text-[10px] tracking-widest uppercase text-slate-500">
            <span className="bg-linear-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent font-bold">
              {text || 'Инициализация TWA'}
            </span>
            <span className="text-slate-400 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 z-10 left-0 right-0 text-center h-8 px-6 max-w-xs mx-auto">
        <p
          key={hintIndex}
          className="text-[11px] font-semibold text-slate-400 font-sans tracking-wide leading-relaxed animate-fade-in"
        >
          {WAITING_HINTS[hintIndex]}
        </p>
      </div>
    </div>
  );
}
