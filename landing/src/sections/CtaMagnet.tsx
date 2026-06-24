export function CtaMagnet() {
  return (
    <section className="pb-20 px-4 select-none transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-950 rounded-4xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          
          {/* Внутреннее сияние (Неоновый взрыв на бэкграунде) */}
          <div className="absolute inset-0 bg-linear-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-2xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/30 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-md">
              Готовы начать?
            </span>
            
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
              Запустите свою витрину записей прямо сейчас
            </h2>
            
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              Присоединяйтесь к мастерам и репетиторам, которые уже автоматизировали свой бизнес и избавились от рутины.
            </p>

            <div className="pt-4">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider py-4 px-10 rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
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
