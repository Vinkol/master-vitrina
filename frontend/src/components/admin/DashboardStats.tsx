interface DashboardStatsProps {
  appointmentsCount: number;
}

export function DashboardStats({ appointmentsCount }: DashboardStatsProps) {
  return (
    <div className="p-4 bg-linear-to-r from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-xs flex justify-between items-center animate-fadeIn">
      <div>
        <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">
          Всего записей в базе
        </p>
        <p className="text-2xl font-black mt-0.5">{appointmentsCount}</p>
      </div>
      <span className="text-2xl bg-white/10 p-2 rounded-xl">📅</span>
    </div>
  );
}
