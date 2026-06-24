import { useState } from 'react';

export function Demo() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'services' | 'crm'>('calendar');

  const features = [
    {
      id: 'calendar' as const,
      icon: '📅',
      title: 'Умный онлайн-календарь',
      description: 'Клиенты сами выбирают свободные слоты. Система автоматически учитывает ваши перерывы и настройки графика.',
    },
    {
      id: 'services' as const,
      icon: '💇‍♂️',
      title: 'Гибкий каталог услуг',
      description: 'Настраивайте категории, длительность сеансов и стоимость. Изменения мгновенно обновляются на витрине.',
    },
    {
      id: 'crm' as const,
      icon: '👥',
      title: 'CRM-система на ладони',
      description: 'Полная база клиентов, история их визитов. Возможность блокировать проблемных пользователей в один клик.',
    },
  ];

  return (
    <section id="demo" className="bg-transparent dark:bg-[#020617] py-24 px-4 select-none transition-colors duration-500 overflow-hidden">
      <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        
        {/* ЛЕВАЯ ЧАСТЬ: Кнопки фич с неоновой подсветкой активной фичи */}
        <div className="md:col-span-7 space-y-4 order-2 md:order-1">
          <div className="mb-8">
            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
              Функционал
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              Полный контроль над записями
            </h2>
          </div>

          <div className="space-y-3">
            {features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 relative overflow-hidden group ${
                  activeTab === feat.id
                    ? 'bg-white dark:bg-slate-900/80 border-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none'
                    : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-slate-900/10'
                }`}
              >
                {/* Индикатор-полоска слева */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-transform duration-300 ${
                  activeTab === feat.id ? 'scale-y-100' : 'scale-y-0'
                }`} />

                <div className="text-2xl mt-0.5">{feat.icon}</div>
                <div>
                  <h3 className={`text-sm font-black transition-colors ${
                    activeTab === feat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Глянцевый Смартфон с неоновым бэкграундом */}
        <div className="md:col-span-5 flex justify-center order-1 md:order-2 relative">
          
          {/* 🌌 Размытый неоновый щит ЗА телефоном для дороговизны */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-80 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="w-70 h-135 bg-slate-950 border-[6px] border-slate-900 dark:border-slate-800 rounded-[44px] p-3.5 shadow-2xl flex flex-col pt-8 relative overflow-hidden transition-all duration-300 ring-1 ring-white/5">
            
            {/* Островок камеры */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20" />

            {/* Шапка внутреннего интерфейса */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4 text-white relative z-10">
              <span className="text-[10px] font-black tracking-wide text-slate-400 uppercase">✨ Моя витрина</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-black border border-indigo-500/20">twa</span>
            </div>

            {/* ЭКРАН 1: Календарь */}
            {activeTab === 'calendar' && (
              <div className="space-y-4 animate-fade-in text-white relative z-10">
                <div className="text-[11px] font-bold text-slate-300">Выберите удобное время</div>
                <div className="flex gap-1.5">
                  {[{ day: 'Пн', num: '24' }, { day: 'Вт', num: '25', active: true }, { day: 'Ср', num: '26' }, { day: 'Чт', num: '27' }].map((d) => (
                    <div key={d.num} className={`flex-1 text-center py-2 rounded-xl border text-[9px] transition-all ${
                      d.active ? 'bg-indigo-600 border-indigo-500 font-black shadow-md shadow-indigo-600/20' : 'bg-slate-900/60 border-slate-800/40 text-slate-400'
                    }`}>
                      <div className="opacity-80">{d.day}</div>
                      <div className="text-[10px] mt-0.5">{d.num}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'].map((time, idx) => (
                    <div key={time} className={`text-center py-2 rounded-lg text-[9px] border transition-colors ${
                      idx === 1 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-black' : 'bg-slate-900/40 border-slate-800/40 text-slate-300'
                    }`}>
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ЭКРАН 2: Каталог */}
            {activeTab === 'services' && (
              <div className="space-y-2.5 animate-fade-in text-white relative z-10">
                <div className="text-[11px] font-bold text-slate-300">Каталог услуг</div>
                {[
                  { name: 'Мужской комплекс', price: '1 500 ₽', time: '50 мин' },
                  { name: 'Оформление бороды', price: '800 ₽', time: '30 мин' },
                  { name: 'Консультация', price: '3 000 ₽', time: '90 мин' },
                ].map((service, idx) => (
                  <div key={service.name} className="bg-slate-900/40 border border-slate-800/40 p-2.5 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black text-slate-200">{service.name}</div>
                      <div className="text-[8px] text-slate-400 font-medium mt-0.5">⏱️ {service.time}</div>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ЭКРАН 3: CRM */}
            {activeTab === 'crm' && (
              <div className="space-y-2.5 animate-fade-in text-white relative z-10">
                <div className="text-[11px] font-bold text-slate-300">База клиентов</div>
                {[
                  { name: 'Александр Котов', status: 'Премиум', color: 'text-emerald-400 bg-emerald-500/10' },
                  { name: 'Анна Борзова', status: 'Новый', color: 'text-indigo-400 bg-indigo-500/10' },
                  { name: 'Дмитрий Лис', status: 'Забанен', color: 'text-rose-400 bg-rose-500/10' },
                ].map((client) => (
                  <div key={client.name} className="bg-slate-900/40 border border-slate-800/40 p-2.5 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] border border-slate-700/50">👤</div>
                      <div className="text-[10px] font-black text-slate-200">{client.name}</div>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${client.color}`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка */}
            <div className="mt-auto mb-2 text-white relative z-10">
              <div className="w-full bg-indigo-600 text-center py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 uppercase tracking-wider">
                {activeTab === 'calendar' ? 'Подтвердить время' : 'Выбрать'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
