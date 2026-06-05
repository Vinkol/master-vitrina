import type { RefObject } from 'react';
import type { CalendarDay, Appointment } from '../../types';

interface CalendarRibbonProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  daysList: CalendarDay[];
  selectedDate: string;
  todayIso: string;
  appointments: Appointment[];
  onDaySelect: (isoDate: string) => void;
}

export function CalendarRibbon({
  scrollRef,
  daysList,
  selectedDate,
  todayIso,
  appointments,
  onDaySelect,
}: CalendarRibbonProps) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 space-y-2">
      <div
        ref={scrollRef}
        className="flex space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {daysList.map((day) => {
          const isSelected = selectedDate === day.isoDate;
          const isToday = day.isoDate === todayIso;
          const hasAppointments = appointments.some((app) => app.date === day.isoDate);

          return (
            <div
              key={day.isoDate}
              data-date={day.isoDate}
              data-month={day.monthLabel}
              data-active={isSelected}
              onClick={() => onDaySelect(day.isoDate)}
              className={`day-tab-card shrink-0 w-14 py-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all snap-center relative active:scale-95 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
                  : isToday
                    ? 'border-indigo-200 bg-indigo-50/40 text-indigo-600 font-semibold'
                    : 'border-slate-100 bg-slate-50/60 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span
                className={`text-[9px] uppercase tracking-wide ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}
              >
                {day.dayOfWeek}
              </span>
              <span className="text-base font-black mt-0.5">{day.dayOfMonth}</span>

              {hasAppointments && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
