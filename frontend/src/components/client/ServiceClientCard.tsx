import type { Service } from '../../types';

interface ServiceItemRowProps {
  service: Service;
  onClick: () => void;
}

export function ServiceClientCard({ service, onClick }: ServiceItemRowProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-center group shadow-xs active:scale-[0.99]"
    >
      <div className="space-y-0.5">
        <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
          {service.title}
        </p>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
          ⏱ {service.duration} мин
        </p>
      </div>
      <div className="text-right">
        <p className="font-black text-indigo-600 text-base">{service.price} ₽</p>
        <p className="text-[10px] text-slate-300 underline decoration-dotted font-medium">
          подробнее
        </p>
      </div>
    </div>
  );
}
