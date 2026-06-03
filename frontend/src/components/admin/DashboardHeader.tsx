interface DashboardHeaderProps {
  visibleMonth: string;
  onOpenMonthModal: () => void;
}

export function DashboardHeader({ visibleMonth, onOpenMonthModal }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-xs border border-slate-100 animate-fadeIn">
      <div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Расписание записей
        </span>
        <h2 className="text-base font-black text-slate-800 capitalize mt-0.5">
          {visibleMonth} 2026
        </h2>
      </div>
      <button
        onClick={onOpenMonthModal}
        className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all active:scale-95 text-xs font-bold"
      >
        <span>📅</span>
        <span>Весь месяц</span>
      </button>
    </div>
  );
}
