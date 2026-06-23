import { memo } from 'react';
import { UserX } from 'lucide-react';

export const CrmEmptyState = memo(function CrmEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white border border-dashed border-slate-200 rounded-3xl text-center animate-fadeIn">
      <div className="p-3.5 bg-slate-50 text-slate-400 rounded-full mb-3 shrink-0">
        <UserX className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <p className="text-xs font-bold text-slate-400">Никого не найдено</p>
      <p className="text-[10px] text-slate-300 mt-0.5">В этой категории клиентов пока нет</p>
    </div>
  );
});
