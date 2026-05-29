import { useMemo } from 'react';
import { generateMonthGrid } from '../../utils/calendarCore';
import type { Appointment } from '../../types';
import { haptic } from '../../utils/haptic';

interface MonthCalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  appointments: Appointment[];
  onDateSelect: (isoDate: string) => void;
}

const WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function MonthCalendarSheet({
  isOpen,
  onClose,
  selectedDate,
  appointments,
  onDateSelect,
}: MonthCalendarSheetProps) {
  const { days, monthName } = useMemo(() => {
    const fallbackDateStr = selectedDate || new Date().toISOString().split('T')[0];
    const base = new Date(fallbackDateStr);
    return generateMonthGrid(base.getFullYear(), base.getMonth());
  }, [selectedDate]);

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
          <h4 className="text-sm font-black text-slate-900 capitalize">{monthName}</h4>
          <button
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl transition-all"
          >
            Готово
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK_DAYS_SHORT.map((d, idx) => (
            <span
              key={d}
              className={`text-[10px] font-black uppercase tracking-wider ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            if (!day.dayNumber || !day.isoDate) {
              return <div key={`empty-${index}`} className="h-10" />;
            }

            const isSelected = selectedDate === day.isoDate;
            const isToday = day.isoDate === new Date().toISOString().split('T')[0];
            const hasAppointments = appointments.some((app) => app.date === day.isoDate);

            return (
              <button
                type="button"
                key={day.isoDate}
                onClick={() => {
                  if (day.isoDate) {
                    haptic.impact('light');
                    onDateSelect(day.isoDate);
                  }
                }}
                className={`h-10 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs transition-all active:scale-90 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isToday
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
    </div>
  );
}
