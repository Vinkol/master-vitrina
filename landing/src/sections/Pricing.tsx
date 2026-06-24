import { useState } from 'react';
import { Button } from '../components/Button';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Базовый',
      price: '0',
      description: 'Все основные инструменты для легкого старта',
      features: ['До 30 записей в месяц', 'Каталог услуг и прайс', 'Онлайн-календарь 24/7', 'Базовая статистика клиентов'],
      buttonText: 'Начать бесплатно',
      isPopular: false,
      tag: 'Для новичков',
    },
    {
      name: 'Профессиональный',
      price: isAnnual ? '390' : '490',
      description: 'Максимум возможностей для роста вашего дохода',
      features: ['Безлимитные записи клиентов', 'Умная CRM и история визитов', 'Черный список (Блокировка)', 'Аналитика прибыли за месяц', 'Приоритетная поддержка 24/7'],
      buttonText: 'Активировать PRO',
      isPopular: true,
      tag: 'Рекомендуем',
    },
    {
      name: 'Бизнес / Студия',
      price: isAnnual ? '990' : '1190',
      description: 'Для небольших студий, салонов и команд',
      features: ['До 5 мастеров в одной витрине', 'Авто-напоминания клиентам', 'Рассылки по базе в Telegram', 'Экспорт базы в Excel/CSV', 'Персональный менеджер'],
      buttonText: 'Подключить Студию',
      isPopular: false,
      tag: 'Для команд',
    },
  ];

  return (
    <section id="pricing" className="bg-transparent py-24 px-4 select-none transition-colors duration-500 relative">
      <div className="max-w-6xl mx-auto text-center">
        
        <div className="mb-4">
          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
            Тарифы
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Инвестируйте в свой комфорт
        </h2>

        {/* Переключатель периода */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>Ежемесячно</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors relative flex items-center cursor-pointer"
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
            Ежегодно <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black">Скидка 20%</span>
          </span>
        </div>

        {/* Новая трехколоночная сетка */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-slate-900/40 rounded-3xl p-6 lg:p-8 text-left flex flex-col justify-between transition-all duration-300 relative border ${
                plan.isPopular 
                  ? 'border-indigo-500 dark:border-indigo-500/80 neon-glow md:scale-105 z-10' 
                  : 'border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              {/* Верхний аккуратный бейдж для каждой карточки */}
              <span className={`absolute -top-3 left-6 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm ${
                plan.isPopular 
                  ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
              }`}>
                {plan.tag}
              </span>
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">{plan.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-relaxed min-h-8">{plan.description}</p>
                
                <div className="flex items-baseline gap-1.5 my-6">
                  <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">{plan.price} ₽</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ month</span>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-5" />

                <ul className="space-y-3.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[9px]">
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant={plan.isPopular ? 'popular' : 'secondary'}>
                {plan.buttonText}
              </Button>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


