export function Steps() {
  const steps = [
    {
      number: '01',
      title: 'Запустите бота в 1 клик',
      description: 'Никаких паролей, подтверждений почты и длинных анкет. Просто нажмите Start в Telegram, и ваш личный кабинет мастера уже готов к работе.',
      badge: 'Займет 5 секунд',
      gridClass: 'md:col-span-2',
      bgGlow: 'from-blue-500/10 to-transparent'
    },
    {
      number: '02',
      title: 'Настройте услуги',
      description: 'Укажите цены, категории и длительность сеансов за пару тапов.',
      badge: 'Проще, чем Excel',
      gridClass: 'md:col-span-1',
      bgGlow: 'from-purple-500/10 to-transparent'
    },
    {
      number: '03',
      title: 'Поделитесь ссылкой',
      description: 'Разместите готовую ссылку в профиле Instagram, Telegram или отправляйте клиентам в личные сообщения. Записи начнут падать автоматически.',
      badge: 'Автопилот 24/7',
      gridClass: 'md:col-span-3',
      bgGlow: 'from-pink-500/10 to-indigo-500/5'
    },
  ];

  return (
    <section id="steps" className="dark:to-purple-600/10 py-12 px-4 select-none transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Хедер секции */}
        <div className="text-center max-w-md mx-auto mb-16">
          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
            Процесс
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            Как это устроено
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 group ${step.gridClass}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${step.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-5xl font-black bg-linear-to-b from-indigo-500/90 to-transparent bg-clip-text text-transparent dark:from-indigo-400/70">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-black tracking-wide text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

