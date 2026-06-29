import { Briefcase, Calendar, Clock, Timer } from 'lucide-react';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { formatPrice } from '../../shared/lib/formatPrice/priceFormatter';
import { useBookingStore } from '../../store/useBookingStore';

interface BookingDetailsCardProps {
  service: { title: string; duration: number; price: number } | null;
  date: string | null;
  time: string | null;
}

export function BookingDetailsCard({ service, date, time }: BookingDetailsCardProps) {
  const masterCurrency = useBookingStore((state) => state.masterProfile?.currency) || 'RUB';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left animate-fadeIn">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
        Детали вашего визита
      </h4>
      <div className="space-y-3">
        <div className="flex items-start space-x-2 text-sm font-bold text-slate-700">
          <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="min-w-0">
            Услуга: <span className="text-indigo-600 font-extrabold">{service?.title}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium pl-6">
          <Timer className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
          <span>Длительность: {service?.duration} мин</span>
          <span className="text-slate-300">·</span>
          <span className="text-indigo-600 font-bold">
            Цена: {service ? formatPrice(service.price, masterCurrency) : ''}
          </span>
        </div>
        <div className="h-px bg-slate-100 my-2" />
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
          <p>
            Дата:{' '}
            <span className="font-extrabold text-slate-800">
              {date ? formatToUserDate(date) : ''}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
          <p>
            Время: <span className="text-indigo-600 font-black">{time}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
