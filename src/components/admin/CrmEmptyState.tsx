import { memo } from 'react';

export const CrmEmptyState = memo(function CrmEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white border border-dashed border-slate-200 rounded-3xl text-center animate-fadeIn">
      <span className="text-3xl mb-2">🍃</span>
      <p className="text-xs font-bold text-slate-400">Никого не найдено</p>
      <p className="text-[10px] text-slate-300 mt-0.5">В этой категории клиентов пока нет</p>
    </div>
  );
});
