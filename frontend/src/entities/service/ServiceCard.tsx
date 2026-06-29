import { formatPrice } from '../../shared/lib/formatPrice/priceFormatter';
import { haptic } from '../../shared/lib/haptic/haptic';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';
import { Pencil, Clock, Trash2 } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const masterCurrency = useBookingStore((state) => state.masterProfile?.currency) || 'RUB';

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex justify-between items-center group animate-fadeIn cursor-pointer transition-all active:scale-[0.99]">
      <div
        onClick={() => {
          haptic.impact('light');
          onEdit(service);
        }}
        className="space-y-0.5 flex-1 pr-4 min-w-0"
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
            {service.title}
          </p>
          <Pencil
            className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex items-center text-xs text-slate-400 font-medium mt-1 space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
          <span>{service.duration} мин</span>
          <span className="text-slate-300 font-light">·</span>
          <span className="text-indigo-600 font-extrabold">
            {formatPrice(service.price, masterCurrency)}
          </span>
        </div>

        {service.description && (
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1.5 bg-slate-50 px-2 py-0.5 rounded-md inline-block font-medium max-w-full">
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
        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-100 shrink-0 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
