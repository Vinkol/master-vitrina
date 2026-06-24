import { Button } from '../components/Button';

export function Hero() {
  return (
    <section id="hero" className=" animate-grid-flow pt-36 pb-28 px-4 select-none transition-colors duration-500 relative overflow-hidden min-h-[85vh] flex items-center">
      {/* neon-градиентные сферы на фоне */}
      <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-indigo-500/20 dark:from-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
        {/* ================= ЛЕТАЮЩИЕ ВИДЖЕТЫ ================= */}
        {/* Виджет 1: Слева от заголовка (Уведомление о записи) */}
        <div className="hidden lg:flex absolute -left-15 top-12 glass-widget p-3.5 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none items-center gap-3 animate-float-1 max-w-52.5 text-left">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-bold">✓</div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Новая запись!</div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 leading-none">Маникюр, 14:00</div>
          </div>
        </div>
        {/* Виджет 2: Справа от заголовка (Выбор слота времени) */}
        <div className="hidden lg:block absolute -right-10 top-4 glass-widget p-4 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none animate-float-2 text-left w-45">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-2">Доступное время</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-indigo-600 text-white text-center py-1 rounded-md text-[10px] font-black shadow-md shadow-indigo-600/20">10:00</div>
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-center py-1 rounded-md text-[10px] font-bold">12:30</div>
          </div>
        </div>
        {/* Виджет 3: Снизу слева (Рейтинг / Мастер) */}
        <div className="hidden lg:flex absolute -left-5 bottom-4 glass-widget p-3 rounded-xl shadow-lg items-center gap-2.5 animate-float-2 max-w-42.5 text-left">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">👤</div>
          <div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">Анна (Репетитор)</div>
            <div className="text-[9px] text-amber-500 font-bold mt-1">⭐️ 5.0 (42 отзыва)</div>
          </div>
        </div>
        {/* Заголовок */}
        <h1 
          style={{ animationDelay: '150ms' }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight mt-8 max-w-3xl mx-auto leading-[1.05] opacity-0 animate-reveal"
        >
          Превратите ваш Telegram <br />
          <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            в полноценный бизнес
          </span>
        </h1>
        {/* Описание */}
        <p 
          style={{ animationDelay: '300ms' }}
          className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-6 max-w-xl mx-auto font-medium leading-relaxed opacity-0 animate-reveal"
        >
          Красивая онлайн-витрина записи для ваших клиентов, которая открывается прямо внутри мессенджера. Управляйте расписанием, ведите базу и забудьте про рутину переписок.
        </p>
        {/* Кнопки */}
        <div 
          style={{ animationDelay: '450ms' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none opacity-0 animate-reveal"
        >
          <Button 
            variant="popular"
            as="a"
            href="https://t.me/mastervitrinabot"
            target="_blank"
            rel="noreferrer"
            className="sm:w-auto px-10"
          >
            Запустить бесплатно
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="sm:w-auto px-10"
          >
            Посмотреть тарифы
          </Button>
        </div>

      </div>
    </section>
  );
}



