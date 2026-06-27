import { useEffect, useMemo, useState, useRef } from 'react';
import type { Appointment } from '../../types';
import { generateMonthGrid, type MonthGridResult } from '../../shared/lib/calendar/calendarCore';
import { haptic } from '../../shared/lib/haptic/haptic';

interface MonthCalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  appointments: Appointment[];
  onDateSelect: (isoDate: string) => void;
}

const WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getAdminCarouselData(): MonthGridResult[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  return [
    generateMonthGrid(currentYear, currentMonthIdx),
    generateMonthGrid(currentYear, currentMonthIdx + 1),
    generateMonthGrid(currentYear, currentMonthIdx + 2),
  ];
}

export function MonthCalendarSheet({
  isOpen,
  onClose,
  selectedDate,
  appointments,
  onDateSelect,
}: MonthCalendarSheetProps) {
  const monthsGroup = useMemo(() => getAdminCarouselData(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<string>(
    () => monthsGroup[0]?.monthName || 'Календарь',
  );

  const todayIso = useMemo(() => {
    const d = new Date();
    const utcYear = d.getUTCFullYear();
    const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(d.getUTCDate()).padStart(2, '0');
    return `${utcYear}-${utcMonth}-${utcDay}`;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

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

    const monthBlocks = container.querySelectorAll('.admin-month-block');
    monthBlocks.forEach((block) => observer.observe(block));

    return () => {
      monthBlocks.forEach((block) => observer.unobserve(block));
      observer.disconnect();
    };
  }, [isOpen, monthsGroup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={() => {
          haptic.impact('light');
          onClose();
        }}
      />

      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4 pb-8">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

        <div className="flex justify-between items-center px-1">
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Выбор даты
            </h4>
            <p className="text-sm font-black text-indigo-600 capitalize mt-0.5">
              {currentVisibleMonth}
            </p>
          </div>
          <button
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
          >
            Закрыть
          </button>
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
              className="admin-month-block shrink-0 w-full snap-start snap-always pr-4 space-y-3 select-none"
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

              <div className="grid grid-cols-7 gap-1.5 bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100/60">
                {group.days.map((day, index) => {
                  if (!day.dayNumber || !day.isoDate) {
                    return <div key={`empty-${index}`} className="h-10" />;
                  }

                  const currentDayIso = day.isoDate.split('T')[0];
                  const isSelected = selectedDate.split('T')[0] === currentDayIso;
                  const isToday = currentDayIso === todayIso;
                  const dayAppointmentsCount = appointments.filter(
                    (app) => app.date.split('T')[0] === currentDayIso,
                  ).length;
                  const hasAppointments = dayAppointmentsCount > 0;

                  return (
                    <button
                      type="button"
                      key={day.isoDate}
                      onClick={() => {
                        if (day.isoDate) {
                          haptic.impact('light');
                          onDateSelect(currentDayIso);
                        }
                      }}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs transition-all active:scale-90 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md font-black'
                          : isToday
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'bg-white border-slate-100 text-slate-700 shadow-xs hover:border-slate-200'
                      }`}
                    >
                      <span className={hasAppointments ? 'mt-0.5' : ''}>{day.dayNumber}</span>
                      {hasAppointments && (
                        <span
                          className={`absolute -top-1 -right-1 min-w-3.75 h-3.5 px-0.5 flex items-center justify-center text-[8px] font-black rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-white text-indigo-600 border-indigo-600'
                              : 'bg-indigo-500 text-white border-white'
                          }`}
                        >
                          {dayAppointmentsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
