export function Steps() {
  const steps = [
    {
      number: '01',
      title: 'Запустите бота в 1 клик',
      description:
        'Никаких паролей, подтверждений почты и длинных анкет. Просто нажмите Start в Telegram, и ваш личный кабинет мастера уже готов к работе.',
      badge: 'Займет 5 секунд',
      gridClass: 'md:col-span-2',
      bgGlow: 'from-blue-500/10 to-transparent',
    },
    {
      number: '02',
      title: 'Настройте услуги',
      description: 'Укажите цены, категории и длительность сеансов за пару тапов.',
      badge: 'Проще, чем Excel',
      gridClass: 'md:col-span-1',
      bgGlow: 'from-purple-500/10 to-transparent',
    },
    {
      number: '03',
      title: 'Поделитесь ссылкой',
      description:
        'Разместите готовую ссылку в профиле Instagram, Telegram или отправляйте клиентам в личные сообщения. Записи начнут падать автоматически.',
      badge: 'Автопилот 24/7',
      gridClass: 'md:col-span-3',
      bgGlow: 'from-pink-500/10 to-indigo-500/5',
    },
  ];

  return (
    <section
      id="steps"
      className="px-4 py-12 transition-colors duration-500 select-none dark:to-purple-600/10"
    >
      <div className="mx-auto max-w-4xl">
        {/* Хедер секции */}
        <div className="mx-auto mb-16 max-w-md text-center">
          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-black tracking-wider text-indigo-600 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
            Процесс
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Как это устроено
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-50/50 p-8 transition-all duration-300 hover:border-indigo-500/40 dark:border-slate-800/60 dark:bg-slate-900/20 dark:hover:border-indigo-500/30 ${step.gridClass}`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${step.bgGlow} pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <span className="bg-linear-to-b from-indigo-500/90 to-transparent bg-clip-text text-5xl font-black text-transparent dark:from-indigo-400/70">
                    {step.number}
                  </span>
                  <span className="rounded-md border border-indigo-100/50 bg-indigo-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-indigo-600 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
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
