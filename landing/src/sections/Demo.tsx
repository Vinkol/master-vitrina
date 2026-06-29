import { useState, useEffect } from 'react';
import { PhoneCanvasDemo } from '../components/PhoneCanvasDemo';
import screen1 from '../assets/1.png';
import screen2 from '../assets/2.png';
import screen3 from '../assets/3.png';

const FEATURES_DATA = [
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

export function Demo() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'services' | 'crm'>('calendar');
  const [slideIdx, setSlideIdx] = useState<number>(0);

  const presentationScreens = [screen2, screen1, screen3];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prevIdx) => (prevIdx + 1) % presentationScreens.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [presentationScreens.length]);

  return (
    <section
      id="demo"
      className="bg-white px-4 py-12 transition-colors duration-500 select-none dark:bg-[#020617]"
    >
      <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-12">
        {/* ЛЕВАЯ ЧАСТЬ */}
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
            {FEATURES_DATA.map((feat) => (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`group relative flex w-full cursor-pointer gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                  activeTab === feat.id
                    ? 'border-indigo-500 bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-900/80 dark:shadow-none'
                    : 'border-transparent bg-transparent hover:bg-white/40 dark:hover:bg-slate-900/10'
                }`}
              >
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

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className="relative order-1 flex justify-center md:order-2 md:col-span-5">
          <PhoneCanvasDemo
            images={presentationScreens}
            activeIdx={slideIdx}
          />
        </div>
      </div>
    </section>
  );
}
