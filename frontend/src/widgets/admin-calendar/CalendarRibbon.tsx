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
          const dayIsoStr = day.isoDate.toString();
          const isSelected = selectedDate.toString() === dayIsoStr;
          const isToday = dayIsoStr === todayIso.toString();
          const dayAppointmentsCount = appointments.filter(
            (app) => app.date.toString() === dayIsoStr,
          ).length;
          const hasAppointments = dayAppointmentsCount > 0;

          return (
            <div
              key={dayIsoStr}
              data-date={dayIsoStr}
              data-month={day.monthLabel}
              data-active={isSelected}
              onClick={() => onDaySelect(dayIsoStr)}
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

              {hasAppointments && (
                <span
                  className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-black rounded-full border shadow-xs transition-colors ${
                    isSelected
                      ? 'bg-white text-indigo-600 border-indigo-600'
                      : 'bg-indigo-600 text-white border-white'
                  }`}
                >
                  {dayAppointmentsCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
