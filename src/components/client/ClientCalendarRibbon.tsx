import { useEffect, useMemo, useState, type RefObject } from 'react';
import { generateMonthGrid, type MonthGridResult } from '../../utils/calendarCore';
import type { Appointment } from '../../types';
import { haptic } from '../../utils/haptic';

interface ClientCalendarRibbonProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  selectedDate: string;
  appointments: Appointment[];
  onSelectDay: (isoDate: string) => void;
}

const WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getClientCarouselData(): MonthGridResult[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  return [
    generateMonthGrid(currentYear, currentMonthIdx),
    generateMonthGrid(currentYear, currentMonthIdx + 1),
    generateMonthGrid(currentYear, currentMonthIdx + 2),
  ];
}

export function ClientCalendarRibbon({
  scrollRef,
  selectedDate,
  appointments,
  onSelectDay,
}: ClientCalendarRibbonProps) {
  const monthsGroup = useMemo(() => getClientCarouselData(), []);
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<string>(
    () => monthsGroup[0]?.monthName || 'Календарь',
  );

  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: '0px -30% 0px -30%',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const monthName = entry.target.getAttribute('data-month-name');
          if (monthName) setCurrentVisibleMonth(monthName);
        }
      });
    }, observerOptions);

    const monthBlocks = container.querySelectorAll('.month-carousel-block');
    monthBlocks.forEach((block) => observer.observe(block));

    return () => {
      monthBlocks.forEach((block) => observer.unobserve(block));
      observer.disconnect();
    };
  }, [monthsGroup, scrollRef]);

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center px-1">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Выберите дату записи
          </h4>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">Свайп для смены месяца ➔</p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl capitalize shadow-xs transition-all">
          {currentVisibleMonth}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {monthsGroup.map((group) => (
          <div
            key={group.monthName}
            data-month-name={group.monthName}
            className="month-carousel-block shrink-0 w-full snap-start snap-always pr-4 space-y-3"
          >
            <div className="grid grid-cols-7 gap-1 text-center px-2">
              {WEEK_DAYS_SHORT.map((d, idx) => (
                <span
                  key={d}
                  className={`text-[10px] font-black uppercase tracking-wider ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/60">
              {group.days.map((day, index) => {
                if (!day.dayNumber || !day.isoDate) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const isSelected = selectedDate === day.isoDate;
                const isToday = day.isoDate === todayIso;
                const hasAppointments = appointments.some((app) => app.date === day.isoDate);

                return (
                  <button
                    type="button"
                    key={day.isoDate}
                    onClick={() => {
                      if (day.isoDate) {
                        haptic.impact('light');
                        onSelectDay(day.isoDate);
                      }
                    }}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs transition-all active:scale-90 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-black'
                        : isToday
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                          : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200 shadow-xs'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    {hasAppointments && (
                      <span
                        className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
