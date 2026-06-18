import type { ReactNode } from 'react';

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
      className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left"
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex shrink-0">
          <div className="flex shrink-0 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xl group-hover:bg-indigo-100 transition-colors">
            {icon}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
            {title}
          </p>
          <p className="text-xs text-slate-400 truncate pr-2 font-medium">{subtitle}</p>
        </div>
      </div>
      <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-base font-bold shrink-0">
        →
      </span>
    </button>
  );
}
