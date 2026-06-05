import { useClientCalendar } from './useClientCalendar';
import type { Appointment } from '../../types';
import type { RefObject } from 'react';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { CalendarDayButton } from '../../components/client/CalendarDayButton';

interface ClientCalendarRibbonProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  selectedDate: string;
  appointments: Appointment[];
  onSelectDay: (isoDate: string) => void;
}

const WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function ClientCalendarRibbon({
  scrollRef,
  selectedDate,
  appointments,
  onSelectDay,
}: ClientCalendarRibbonProps) {
  const calendar = useClientCalendar({ scrollRef });

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4 animate-fadeIn">
      {/* Шапка блока */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {selectedDate ? `Выбрано: ${formatToUserDate(selectedDate)}` : 'Выберите дату записи'}
          </h4>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">Свайп для смены месяца ➔</p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl capitalize shadow-xs transition-all">
          {calendar.currentVisibleMonth}
        </span>
      </div>

      {/* Горизонтальный контейнер месяцев */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {calendar.monthsGroup.map((group) => (
          <div
            key={group.monthName}
            data-month-name={group.monthName}
            className="month-carousel-block shrink-0 w-full snap-start snap-always pr-4 space-y-3"
          >
            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 text-center px-2">
              {WEEK_DAYS_SHORT.map((d, idx) => (
                <span
                  key={d}
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    idx >= 5 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Сетка дней месяца */}
            <div className="grid grid-cols-7 gap-1.5 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/60">
              {group.days.map((day, index) => {
                if (!day.dayNumber || !day.isoDate) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const currentDayIso = day.isoDate.split('T')[0];
                const isSelected = selectedDate.split('T')[0] === currentDayIso;
                const isToday = currentDayIso === calendar.todayIso;
                const hasAppointments = appointments.some(
                  (app) => app.date.split('T')[0] === currentDayIso,
                );

                return (
                  <CalendarDayButton
                    key={day.isoDate}
                    dayNumber={day.dayNumber}
                    currentDayIso={currentDayIso}
                    isSelected={isSelected}
                    isToday={isToday}
                    hasAppointments={hasAppointments}
                    onSelectDay={onSelectDay}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
