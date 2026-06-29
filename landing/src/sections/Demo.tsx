import { useState } from 'react';

export function Demo() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'services' | 'crm'>('calendar');

  const features = [
    {
      id: 'calendar' as const,
      icon: '📅',
      title: 'Умный онлайн-календарь',
      description:
        'Клиенты сами выбирают свободные слоты. Система автоматически учитывает ваши перерывы и настройки графика.',
    },
    {
      id: 'services' as const,
      icon: '💇‍♂️',
      title: 'Гибкий каталог услуг',
      description:
        'Настраивайте категории, длительность сеансов и стоимость. Изменения мгновенно обновляются на витрине.',
    },
    {
      id: 'crm' as const,
      icon: '👥',
      title: 'CRM-система на ладони',
      description:
        'Полная база клиентов, история их визитов. Возможность блокировать проблемных пользователей в один клик.',
    },
  ];

  return (
    <section
      id="demo"
      className="overflow-hidden bg-transparent px-4 py-24 transition-colors duration-500 select-none dark:bg-[#020617]"
    >
      <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-12">
        {/* ЛЕВАЯ ЧАСТЬ: Кнопки фич с неоновой подсветкой активной фичи */}
        <div className="order-2 space-y-4 md:order-1 md:col-span-7">
          <div className="mb-8">
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-black tracking-wider text-indigo-600 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
              Функционал
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Полный контроль над записями
            </h2>
          </div>

          <div className="space-y-3">
            {features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`group relative flex w-full cursor-pointer gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                  activeTab === feat.id
                    ? 'border-indigo-500 bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-900/80 dark:shadow-none'
                    : 'border-transparent bg-transparent hover:bg-white/40 dark:hover:bg-slate-900/10'
                }`}
              >
                {/* Индикатор-полоска слева */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1 bg-indigo-500 transition-transform duration-300 ${
                    activeTab === feat.id ? 'scale-y-100' : 'scale-y-0'
                  }`}
                />

                <div className="mt-0.5 text-2xl">{feat.icon}</div>
                <div>
                  <h3
                    className={`text-sm font-black transition-colors ${
                      activeTab === feat.id
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                    {feat.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Глянцевый Смартфон с неоновым бэкграундом */}
        <div className="relative order-1 flex justify-center md:order-2 md:col-span-5">
          {/* 🌌 Размытый неоновый щит ЗА телефоном для дороговизны */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[60px] dark:bg-indigo-500/10" />

          <div className="relative flex h-135 w-70 flex-col overflow-hidden rounded-[44px] border-[6px] border-slate-900 bg-slate-950 p-3.5 pt-8 shadow-2xl ring-1 ring-white/5 transition-all duration-300 dark:border-slate-800">
            {/* Островок камеры */}
            <div className="absolute top-3 left-1/2 z-20 h-4 w-24 -translate-x-1/2 rounded-full bg-black" />

            {/* Шапка внутреннего интерфейса */}
            <div className="relative z-10 mb-4 flex items-center justify-between border-b border-slate-900 pb-2 text-white">
              <span className="text-[10px] font-black tracking-wide text-slate-400 uppercase">
                ✨ Моя витрина
              </span>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-black text-indigo-400">
                twa
              </span>
            </div>

            {/* ЭКРАН 1: Календарь */}
            {activeTab === 'calendar' && (
              <div className="animate-fade-in relative z-10 space-y-4 text-white">
                <div className="text-[11px] font-bold text-slate-300">Выберите удобное время</div>
                <div className="flex gap-1.5">
                  {[
                    { day: 'Пн', num: '24' },
                    { day: 'Вт', num: '25', active: true },
                    { day: 'Ср', num: '26' },
                    { day: 'Чт', num: '27' },
                  ].map((d) => (
                    <div
                      key={d.num}
                      className={`flex-1 rounded-xl border py-2 text-center text-[9px] transition-all ${
                        d.active
                          ? 'border-indigo-500 bg-indigo-600 font-black shadow-md shadow-indigo-600/20'
                          : 'border-slate-800/40 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div className="opacity-80">{d.day}</div>
                      <div className="mt-0.5 text-[10px]">{d.num}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'].map((time, idx) => (
                    <div
                      key={time}
                      className={`rounded-lg border py-2 text-center text-[9px] transition-colors ${
                        idx === 1
                          ? 'border-indigo-500 bg-indigo-600/20 font-black text-indigo-300'
                          : 'border-slate-800/40 bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ЭКРАН 2: Каталог */}
            {activeTab === 'services' && (
              <div className="animate-fade-in relative z-10 space-y-2.5 text-white">
                <div className="text-[11px] font-bold text-slate-300">Каталог услуг</div>
                {[
                  { name: 'Мужской комплекс', price: '1 500 ₽', time: '50 мин' },
                  { name: 'Оформление бороды', price: '800 ₽', time: '30 мин' },
                  { name: 'Консультация', price: '3 000 ₽', time: '90 мин' },
                ].map((service, idx) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-900/40 p-2.5"
                  >
                    <div>
                      <div className="text-[10px] font-black text-slate-200">{service.name}</div>
                      <div className="mt-0.5 text-[8px] font-medium text-slate-400">
                        ⏱️ {service.time}
                      </div>
                    </div>
                    <div
                      className={`rounded-md px-2 py-0.5 text-[9px] font-black ${idx === 0 ? 'bg-indigo-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-300'}`}
                    >
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ЭКРАН 3: CRM */}
            {activeTab === 'crm' && (
              <div className="animate-fade-in relative z-10 space-y-2.5 text-white">
                <div className="text-[11px] font-bold text-slate-300">База клиентов</div>
                {[
                  {
                    name: 'Александр Котов',
                    status: 'Премиум',
                    color: 'text-emerald-400 bg-emerald-500/10',
                  },
                  {
                    name: 'Анна Борзова',
                    status: 'Новый',
                    color: 'text-indigo-400 bg-indigo-500/10',
                  },
                  { name: 'Дмитрий Лис', status: 'Забанен', color: 'text-rose-400 bg-rose-500/10' },
                ].map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-900/40 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800 text-[9px]">
                        👤
                      </div>
                      <div className="text-[10px] font-black text-slate-200">{client.name}</div>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-black ${client.color}`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка */}
            <div className="relative z-10 mt-auto mb-2 text-white">
              <div className="w-full rounded-xl bg-indigo-600 py-2.5 text-center text-[10px] font-black tracking-wider uppercase shadow-lg shadow-indigo-600/20">
                {activeTab === 'calendar' ? 'Подтвердить время' : 'Выбрать'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
