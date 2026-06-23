import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuRowButtonProps {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export function MenuRowButton({ onClick, icon, title, subtitle }: MenuRowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left cursor-pointer"
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 group-hover:bg-indigo-100 transition-colors flex items-center justify-center">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tight">
            {title}
          </p>
          <p className="text-xs text-slate-400 truncate pr-2 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>

      <ChevronRight
        className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0"
        strokeWidth={2.5}
      />
    </button>
  );
}
