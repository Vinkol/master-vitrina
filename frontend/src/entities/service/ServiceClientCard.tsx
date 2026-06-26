import { formatPrice } from '../../shared/lib/formatPrice/priceFormatter';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';
import { Clock, ChevronRight } from 'lucide-react';

interface ServiceItemRowProps {
  service: Service;
  onClick: () => void;
}

export function ServiceClientCard({ service, onClick }: ServiceItemRowProps) {
  const masterCurrency = useBookingStore((state) => state.masterProfile?.currency) || 'RUB';

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-center group shadow-xs active:scale-[0.99] min-w-0"
    >
      <div className="space-y-1 flex-1 pr-4 min-w-0">
        <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
          {service.title}
        </p>
        <div className="flex items-center text-xs text-slate-400 font-medium space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
          <span>{service.duration} мин</span>
        </div>
      </div>
      <div className="text-right flex items-center space-x-2 shrink-0">
        <div>
          <p className="font-extrabold text-indigo-600 text-base leading-none">
            {formatPrice(service.price, masterCurrency)}
          </p>
          <p className="text-[10px] text-slate-400 underline decoration-dotted font-medium mt-1 inline-block">
            подробнее
          </p>
        </div>
        <ChevronRight
          className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}
