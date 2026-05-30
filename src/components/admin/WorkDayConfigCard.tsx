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
      {/* Шапка дня */}
      <div
        onClick={() => {
          haptic.impact('light');
          onUpdateDay({
            is_working: !day.is_working,
          });
        }}
        className="flex justify-between items-center mb-1 py-1 cursor-pointer active:scale-[0.99] transition-all select-none"
      >
        <span className="text-sm font-black text-slate-700 tracking-tight">{dayName}</span>

        <span
          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl transition-all ${
            day.is_working
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-100/40'
              : 'text-slate-400 bg-slate-200/60 border border-transparent'
          }`}
        >
          {day.is_working ? 'Работаю' : 'Выходной'}
        </span>
      </div>

      {/* Настройки часов работы */}
      {day.is_working && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2.5 w-full">
            {/* Время начала */}
            <div className="flex items-center space-x-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">С</span>
              <input
                type="time"
                value={day.working_start || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateDay({ working_start: e.target.value })
                }
                className="w-full min-w-17.5 p-2 rounded-xl border border-slate-200 text-xs text-center font-bold bg-slate-50 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Время конца */}
            <div className="flex items-center space-x-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">ДО</span>
              <input
                type="time"
                value={day.working_end || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateDay({ working_end: e.target.value })
                }
                className="w-full min-w-17.5 p-2 rounded-xl border border-slate-200 text-xs text-center font-bold bg-slate-50 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Добавить перерыв */}
            <button
              type="button"
              onClick={onAddBreak}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-2.5 rounded-xl transition-colors shrink-0"
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
