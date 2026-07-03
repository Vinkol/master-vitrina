import { Blocks } from 'lucide-react';
import { useEffect } from 'react';

interface ShowcaseNotFoundProps {
  errorText?: string;
}

export function ShowcaseNotFound({ errorText }: ShowcaseNotFoundProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* ФОН */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-600/10 rounded-full mix-blend-screen will-change-transform animate-float-slow" />

      {/* ЦЕНТРАЛЬНЫЙ БЛОК */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs text-center space-y-6">
        {/* Контейнер иконки ошибки */}
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse">
          {/* ИСПОЛЬЗУЕМ ЗНАЧОК ВМЕСТО ЭМОДЗИ */}
          <Blocks className="w-8 h-8 text-rose-400 stroke-[1.5]" />
        </div>

        {/* Текстовый блок */}
        <div className="space-y-2">
          <h2 className="text-lg font-black bg-linear-to-r from-rose-200 via-slate-100 to-amber-200 bg-clip-text text-transparent font-mono tracking-wide uppercase">
            Витрина не найдена
          </h2>
          <p className="text-xs font-medium text-slate-400 font-sans tracking-wide leading-relaxed px-2">
            {errorText ||
              'Возможно, мастер удалил свой профиль, изменил адрес ссылки или сервер временно недоступен.'}
          </p>
        </div>
      </div>
    </div>
  );
}
