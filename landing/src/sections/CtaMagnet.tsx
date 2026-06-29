export function CtaMagnet() {
  return (
    <section className="px-4 pb-20 transition-colors duration-500 select-none">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-4xl bg-slate-950 p-8 text-center shadow-2xl md:p-12">
          {/* Внутреннее сияние (Неоновый взрыв на бэкграунде) */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 opacity-70 blur-2xl" />
          <div className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[80px]" />

          <div className="relative z-10 mx-auto max-w-xl space-y-6">
            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black tracking-widest text-indigo-400 uppercase">
              Готовы начать?
            </span>

            <h2 className="text-3xl leading-none font-black tracking-tight text-white md:text-4xl">
              Запустите свою витрину записей прямо сейчас
            </h2>

            <p className="mx-auto max-w-sm text-xs leading-relaxed font-medium text-slate-400">
              Присоединяйтесь к мастерам и репетиторам, которые уже автоматизировали свой бизнес и
              избавились от рутины.
            </p>

            <div className="pt-4">
              <a
                href="https://t.me/mastervitrinabot"
                target="_blank"
                rel="noreferrer"
                className="inline-block cursor-pointer rounded-xl bg-white px-10 py-4 text-xs font-black tracking-wider text-slate-950 uppercase shadow-lg transition-all hover:bg-slate-100 active:scale-98"
              >
                Открыть бота в Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
