import { Calendar } from 'lucide-react';

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
        <p className="text-2xl font-black mt-0.4">{appointmentsCount}</p>
      </div>
      <div className="flex items-center justify-center bg-white/15 p-2.5 rounded-xl backdrop-blur-xs shrink-0">
        <Calendar className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
    </div>
  );
}
