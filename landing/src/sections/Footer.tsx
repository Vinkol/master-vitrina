export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-4 py-12 transition-colors duration-500 select-none dark:border-slate-900 dark:bg-[#020617]">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Верхняя линия подвала */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Логотип с индикатором статуса */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
              <span className="text-indigo-500">⚡</span> booking.twa
            </div>
            {/* Статус системы (как у Github / Vercel) */}
            <div className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              Все системы работают
            </div>
          </div>

          {/* Ссылки быстрой навигации */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">
            <a
              href="#pricing"
              className="transition-colors hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              Тарифы
            </a>
            <a
              href="#"
              className="transition-colors hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              Оферта
            </a>
            <a
              href="#"
              className="transition-colors hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              Приватность
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              Поддержка
            </a>
          </div>
        </div>

        {/* Нижняя ультра-точечная линия */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-[10px] font-medium text-slate-400 sm:flex-row dark:border-slate-900/60 dark:text-slate-600">
          <div>
            © {new Date().getFullYear()} TWA Booking. Разработано для автоматизации самозанятых
            специалистов.
          </div>
          <div className="tracking-wide">Платформа SaaS-lite • Версия 1.0.0</div>
        </div>
      </div>
    </footer>
  );
}
