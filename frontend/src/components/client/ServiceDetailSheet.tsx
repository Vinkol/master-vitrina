import { formatPrice } from '../../shared/lib/formatPrice/priceFormatter';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';

interface ServiceDetailSheetProps {
  service: Service | null;
  onClose: () => void;
  onSelect: (service: Service) => void;
}

export function ServiceDetailSheet({ service, onClose, onSelect }: ServiceDetailSheetProps) {
  const masterCurrency = useBookingStore((state) => state.masterProfile?.currency) || 'RUB';
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{service.title}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">
              ⏱ Длительность: {service.duration} минут
            </p>
          </div>
          <p className="text-lg font-black text-indigo-600 shrink-0 ml-4">
            {formatPrice(service.price, masterCurrency)}
          </p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium">
          {service.description || 'Описание услуги не указано мастером.'}
        </p>

        <button
          onClick={() => onSelect(service)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm"
        >
          Выбрать эту услугу →
        </button>
      </div>
    </div>
  );
}
