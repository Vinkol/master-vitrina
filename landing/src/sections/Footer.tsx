export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-900 py-12 px-4 select-none transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Верхняя линия подвала */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Логотип с индикатором статуса */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-1.5">
              <span className="text-indigo-500">⚡</span> booking.twa
            </div>
            {/* Статус системы (как у Github / Vercel) */}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Все системы работают
            </div>
          </div>

          {/* Ссылки быстрой навигации */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <a href="#pricing" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Тарифы</a>
            <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Оферта</a>
            <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Приватность</a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Поддержка</a>
          </div>

        </div>

        {/* Нижняя ультра-точечная линия */}
        <div className="border-t border-slate-100 dark:border-slate-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 dark:text-slate-600 font-medium">
          <div>
            © {new Date().getFullYear()} TWA Booking. Разработано для автоматизации самозанятых специалистов.
          </div>
          <div className="tracking-wide">
            Платформа SaaS-lite • Версия 1.0.0
          </div>
        </div>

      </div>
    </footer>
  );
}
