import { haptic } from '../../shared/lib/haptic/haptic';
import type { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex justify-between items-center group animate-fadeIn cursor-pointer transition-all active:scale-[0.99]">
      <div
        onClick={() => {
          haptic.impact('light');
          onEdit(service);
        }}
        className="space-y-0.5 flex-1 pr-4"
      >
        <div className="flex items-center space-x-2">
          <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
            {service.title}
          </p>
          <span className="text-[10px] text-slate-300 font-bold">✏️</span>
        </div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">
          ⏱ {service.duration} мин ·{' '}
          <span className="text-indigo-600 font-extrabold">{service.price} ₽</span>
        </p>
        {service.description && (
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 bg-slate-50 px-2 py-0.5 rounded-md inline-block font-medium">
            {service.description}
          </p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          haptic.impact('medium');
          if (confirm(`Удалить услугу "${service.title}"?`)) {
            onDelete(service.id);
          }
        }}
        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-100 text-sm"
      >
        🗑️
      </button>
    </div>
  );
}
