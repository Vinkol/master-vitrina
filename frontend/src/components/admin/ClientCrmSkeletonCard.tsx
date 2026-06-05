import { memo } from 'react';

export const ClientCrmSkeletonCard = memo(function ClientCrmSkeletonCard() {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center animate-pulse">
      <div className="space-y-2 min-w-0 pr-4 flex-1">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-slate-200 rounded-sm w-28" />
          <div className="h-3.5 bg-slate-100 rounded-md w-12" />
        </div>
        <div className="h-3 bg-slate-100 rounded-sm w-32" />
        <div className="h-3 bg-slate-100 rounded-sm w-44" />
      </div>
      <div className="flex items-center space-x-3 shrink-0">
        {/* Счетчик визитов */}
        <div className="space-y-1 text-right flex flex-col items-end">
          <div className="h-2.5 bg-slate-100 rounded-sm w-10" />
          <div className="h-5 bg-slate-200 rounded-sm w-6" />
        </div>
        <div className="w-8 h-8 bg-slate-100 rounded-xl border border-transparent" />
      </div>
    </div>
  );
});
