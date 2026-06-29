import { Button } from '../components/Button';

export function Hero() {
  return (
    <section
      id="hero"
      className="animate-grid-flow relative flex min-h-[85vh] items-center overflow-hidden px-4 pt-36 pb-28 transition-colors duration-500 select-none"
    >
      {/* neon-градиентные сферы на фоне */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-100 w-100 animate-pulse rounded-full bg-indigo-500/20 blur-[140px] dark:from-indigo-600/10" />

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* ================= ЛЕТАЮЩИЕ ВИДЖЕТЫ ================= */}
        {/* Виджет 1: Слева от заголовка (Уведомление о записи) */}
        <div className="glass-widget animate-float-1 absolute top-12 -left-15 hidden max-w-52.5 items-center gap-3 rounded-2xl p-3.5 text-left shadow-xl shadow-slate-200/40 lg:flex dark:shadow-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
            ✓
          </div>
          <div>
            <div className="text-[10px] font-black tracking-wide text-slate-400 uppercase">
              Новая запись!
            </div>
            <div className="mt-0.5 text-xs leading-none font-black text-slate-800 dark:text-slate-200">
              Маникюр, 14:00
            </div>
          </div>
        </div>
        {/* Виджет 2: Справа от заголовка (Выбор слота времени) */}
        <div className="glass-widget animate-float-2 absolute top-4 -right-10 hidden w-45 rounded-2xl p-4 text-left shadow-xl shadow-slate-200/40 lg:block dark:shadow-none">
          <div className="mb-2 text-[9px] font-black tracking-wide text-slate-400 uppercase">
            Доступное время
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-md bg-indigo-600 py-1 text-center text-[10px] font-black text-white shadow-md shadow-indigo-600/20">
              10:00
            </div>
            <div className="rounded-md bg-slate-100 py-1 text-center text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              12:30
            </div>
          </div>
        </div>
        {/* Виджет 3: Снизу слева (Рейтинг / Мастер) */}
        <div className="glass-widget animate-float-2 absolute bottom-4 -left-5 hidden max-w-42.5 items-center gap-2.5 rounded-xl p-3 text-left shadow-lg lg:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-800">
            👤
          </div>
          <div>
            <div className="text-xs leading-none font-black text-slate-800 dark:text-slate-200">
              Анна (Репетитор)
            </div>
            <div className="mt-1 text-[9px] font-bold text-amber-500">⭐️ 5.0 (42 отзыва)</div>
          </div>
        </div>
        {/* Заголовок */}
        <h1
          style={{ animationDelay: '150ms' }}
          className="animate-reveal mx-auto mt-8 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight text-slate-950 opacity-0 sm:text-5xl md:text-6xl dark:text-white"
        >
          Превратите ваш Telegram <br />
          <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            в полноценный бизнес
          </span>
        </h1>
        {/* Описание */}
        <p
          style={{ animationDelay: '300ms' }}
          className="animate-reveal mx-auto mt-6 max-w-xl text-sm leading-relaxed font-medium text-slate-500 opacity-0 sm:text-base dark:text-slate-400"
        >
          Красивая онлайн-витрина записи для ваших клиентов, которая открывается прямо внутри
          мессенджера. Управляйте расписанием, ведите базу и забудьте про рутину переписок.
        </p>
        {/* Кнопки */}
        <div
          style={{ animationDelay: '450ms' }}
          className="animate-reveal mx-auto flex max-w-sm flex-col items-center justify-center gap-4 opacity-0 sm:max-w-none sm:flex-row"
        >
          <Button
            variant="popular"
            as="a"
            href="https://t.me/mastervitrinabot"
            target="_blank"
            rel="noreferrer"
            className="px-10 sm:w-auto"
          >
            Запустить бесплатно
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-10 sm:w-auto"
          >
            Посмотреть тарифы
          </Button>
        </div>
      </div>
    </section>
  );
}
