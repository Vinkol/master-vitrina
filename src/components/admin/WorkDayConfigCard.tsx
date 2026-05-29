import type { ChangeEvent } from 'react';
import type { DaySchedule, TimeInterval } from '../../types';
import { BreakIntervalRow } from './BreakIntervalRow';
import { haptic } from '../../utils/haptic';

interface WorkDayConfigCardProps {
  day: DaySchedule;
  dayName: string;
  onUpdateDay: (fields: Partial<DaySchedule>) => void;
  onAddBreak: () => void;
  onRemoveBreak: (breakId: string) => void;
  onUpdateBreak: (breakId: string, fields: Partial<TimeInterval>) => void;
}

export function WorkDayConfigCard({
  day,
  dayName,
  onUpdateDay,
  onAddBreak,
  onRemoveBreak,
  onUpdateBreak,
}: WorkDayConfigCardProps) {
  return (
    <div
      className={`p-4 rounded-3xl border transition-all ${
        day.is_working
          ? 'bg-white border-slate-100 shadow-xs'
          : 'bg-slate-100/50 border-dashed border-slate-200 opacity-70'
      }`}
    >
      {/* Шапка конкретного дня */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id={`day-${day.day_index}`}
            checked={day.is_working}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              haptic.impact('light');
              onUpdateDay({ is_working: e.target.checked });
            }}
            className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
          />
          <label
            htmlFor={`day-${day.day_index}`}
            className="text-xs font-black text-slate-700 cursor-pointer"
          >
            {dayName}
          </label>
        </div>
        <span
          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
            day.is_working ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-200/50'
          }`}
        >
          {day.is_working ? 'Работаю' : 'Выходной'}
        </span>
      </div>

      {/* Настройки часов */}
      {day.is_working && (
        <div className="space-y-3 pt-1 border-t border-slate-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-[10px] font-bold text-slate-400">С</span>
              <input
                type="time"
                value={day.working_start}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateDay({ working_start: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold bg-slate-50 focus:border-indigo-500 focus:outline-none text-slate-700"
              />
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-[10px] font-bold text-slate-400">ДО</span>
              <input
                type="time"
                value={day.working_end}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateDay({ working_end: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold bg-slate-50 focus:border-indigo-500 focus:outline-none text-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={onAddBreak}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-2 rounded-xl transition-colors shrink-0"
            >
              + Перерыв
            </button>
          </div>

          {/* Список динамических перерывов */}
          {day.breaks && day.breaks.length > 0 && (
            <div className="space-y-2 pl-4 border-l-2 border-indigo-100 mt-2">
              {day.breaks.map((brk) => (
                <BreakIntervalRow
                  key={brk.id}
                  brk={brk}
                  onUpdateStart={(val) => onUpdateBreak(brk.id, { start: val })}
                  onUpdateEnd={(val) => onUpdateBreak(brk.id, { end: val })}
                  onRemove={() => onRemoveBreak(brk.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
