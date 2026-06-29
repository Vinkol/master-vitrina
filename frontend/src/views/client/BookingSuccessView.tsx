import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../shared/lib/haptic/haptic';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { Briefcase, Calendar, Clock, Timer, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { formatPrice } from '../../shared/lib/formatPrice/priceFormatter';

export function BookingSuccessView() {
  const { selectedService, selectedDate, selectedTime, setScreen, resetBooking, masterProfile } =
    useBookingStore();
  const masterCurrency = masterProfile?.currency || 'RUB';

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.MainButton?.isVisible) {
      tg.MainButton.hide();
    }
  }, []);

  const handleClose = () => {
    haptic.impact('medium');
    resetBooking();
    setScreen('profile');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn flex flex-col justify-between">
      <div className="space-y-5 flex-1 flex flex-col justify-center pt-8">
        {/* ИКОНКА УСПЕХА */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs text-emerald-500 scale-in-out">
            <CheckCircle2 className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Вы успешно записаны!
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed">
            <span className="text-indigo-600 font-bold">{masterProfile?.name || 'мастер'}</span> уже
            ждет вас. Данные визита сохранены.
          </p>
        </div>

        {/* РЕЗЮМЕ ЗАПИСИ  */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4 text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Памятка о визите
          </h4>
          <div className="space-y-3">
            {/* Услуга */}
            <div className="flex items-start space-x-3 text-sm font-bold text-slate-700">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-slate-500 text-xs font-medium">Услуга</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{selectedService?.title}</p>
              </div>
            </div>
            {/* Длительность и Цена */}
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium pl-7">
              <Timer className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
              <span>{selectedService?.duration} мин</span>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-600 font-extrabold">
                {selectedService ? formatPrice(selectedService.price, masterCurrency) : ''}
              </span>
            </div>

            <div className="h-px bg-slate-100 my-2" />
            {/* Дата и Время */}
            <div className="grid grid-cols-2 gap-4 pl-1">
              <div className="flex items-start space-x-2.5">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    Дата
                  </p>
                  <p className="font-extrabold text-sm text-slate-800 mt-0.5">
                    {selectedDate ? formatToUserDate(selectedDate) : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    Время
                  </p>
                  <p className="font-black text-sm text-indigo-600 mt-0.5">{selectedTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
          <p className="text-[11px] text-indigo-900/80 font-semibold leading-relaxed">
            🔔 Если у вас изменятся планы, пожалуйста, свяжитесь с мастером заранее или измените
            запись через главное меню бота.
          </p>
        </div>
      </div>

      {/* КНОПКА ВОЗВРАТА */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mt-auto">
        <button
          onClick={handleClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm active:scale-[0.99]"
        >
          Отлично
        </button>
      </div>
    </div>
  );
}
