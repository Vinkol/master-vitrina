import { useMemo, type ChangeEvent } from 'react';
import { useManualBooking } from './useManualBooking';
import { useBookingStore } from '../../store/useBookingStore';
import { ServiceDropdown } from '../../components/admin/ServiceDropdown';
import { generateAvailableSlots } from '../slot-generation/slotGenerator';
import { haptic } from '../../utils/haptic';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export function ManualBookingModal({ isOpen, onClose, selectedDate }: ManualBookingModalProps) {
  const booking = useManualBooking(selectedDate, onClose);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const appointments = useBookingStore((state) => state.appointments);

  const availableSlots = useMemo<string[]>(() => {
    if (!masterProfile?.schedule || !booking.selectedService || !selectedDate) return [];
    // Вычисляем индекс дня недели (В JS: 0 - Вс, 1 - Пн...). Сдвигаем под нашу БД (Пн - 0)
    const jsDay = new Date(selectedDate).getDay();
    const dbDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const daySchedule = masterProfile.schedule.find((d) => d.day_index === dbDayIndex);
    if (!daySchedule) return [];

    return generateAvailableSlots({
      selectedDate,
      daySchedule,
      selectedService: booking.selectedService,
      appointments,
    });
  }, [selectedDate, booking.selectedService, masterProfile, appointments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0" onClick={booking.handleClose} />

      <form
        onSubmit={booking.handleSave}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto pb-10"
      >
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

        <div>
          <h4 className="text-base font-black text-slate-900">Записать клиента вручную</h4>
          <p className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
            📅 Дата сессии: {selectedDate}
          </p>
        </div>

        {/* Поле: Имя клиента */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Имя клиента *
          </label>
          <input
            type="text"
            required
            placeholder="Например: Анна (Инстаграм)"
            value={booking.clientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => booking.setClientName(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700"
          />
        </div>

        {/* Поле: Телефон */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Телефон клиента
          </label>
          <input
            type="tel"
            placeholder="+7 (999) 000-00-00"
            value={booking.clientPhone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => booking.setClientPhone(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700"
          />
        </div>

        {/* КАСТОМНЫЙ СЕЛЕКТОР УСЛУГ */}
        <ServiceDropdown
          services={booking.services}
          selectedService={booking.selectedService}
          onSelectService={booking.setSelectedService}
        />

        {/* Выбор времени */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Выберите свободное время *
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100 scrollbar-none">
            {availableSlots.length === 0 ? (
              <p className="col-span-4 text-center text-[11px] font-bold text-slate-400 py-4">
                Нет свободных окошек на этот день 🔒
              </p>
            ) : (
              availableSlots.map((hour) => {
                const isSelected = booking.selectedTime === hour;
                return (
                  <button
                    type="button"
                    key={hour}
                    onClick={() => {
                      haptic.impact('light');
                      booking.setSelectedTime(hour);
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all active:scale-95 text-center ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {hour}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="pt-2 flex space-x-2.5">
          <button
            type="button"
            onClick={booking.handleClose}
            className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl border border-slate-200 transition-all text-sm active:scale-95"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={booking.isSubmitting || !booking.selectedTime}
            className={`w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm active:scale-95 ${
              booking.isSubmitting || !booking.selectedTime ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {booking.isSubmitting ? 'Сохранение...' : 'Записать'}
          </button>
        </div>
      </form>
    </div>
  );
}
