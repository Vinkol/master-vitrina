import type { ChangeEvent } from 'react';
import type { TimeInterval } from '../../types';

interface BreakIntervalRowProps {
  brk: TimeInterval;
  onUpdateStart: (value: string) => void;
  onUpdateEnd: (value: string) => void;
  onRemove: () => void;
}

export function BreakIntervalRow({
  brk,
  onUpdateStart,
  onUpdateEnd,
  onRemove,
}: BreakIntervalRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 bg-slate-50/60 p-1.5 rounded-xl border border-slate-100 animate-fadeIn">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
        Перерыв:
      </span>
      <input
        type="time"
        value={brk.start}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateStart(e.target.value)}
        className="w-20 p-1 rounded-md border border-slate-200 text-[11px] text-center font-bold bg-white focus:border-indigo-500 focus:outline-none text-slate-700"
      />
      <span className="text-[10px] font-bold text-slate-300">—</span>
      <input
        type="time"
        value={brk.end}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateEnd(e.target.value)}
        className="w-20 p-1 rounded-md border border-slate-200 text-[11px] text-center font-bold bg-white focus:border-indigo-500 focus:outline-none text-slate-700"
      />
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
