import type { ChangeEvent } from 'react';
import { useManualBookingModal } from './useManualBookingModal';
import { ServiceDropdown } from '../../components/admin/ServiceDropdown';
import { TimeSlotButton } from './TimeSlotButton';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { MonthCalendarSheet } from '../../widgets/admin-calendar/MonthCalendarSheet';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export function ManualBookingModal({ isOpen, onClose, selectedDate }: ManualBookingModalProps) {
  const modal = useManualBookingModal(selectedDate, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0" onClick={modal.booking.handleClose} />

      <form
        onSubmit={() => {
          void modal.booking.handleSave;
        }}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto pb-10"
      >
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

        {/* Заголовок и Бадж Даты */}
        <div>
          <h4 className="text-base font-black text-slate-900">Записать клиента вручную</h4>
          <button
            type="button"
            onClick={modal.handleOpenCalendar}
            className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-md inline-flex items-center space-x-1 mt-1.5 active:scale-95 transition-all cursor-pointer border border-indigo-100/40"
          >
            <span>📅 Дата сессии: {formatToUserDate(modal.currentDate)}</span>
            <span className="text-[8px] text-indigo-400">▼</span>
          </button>
        </div>

        {/* Имя клиента */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Имя клиента *
          </label>
          <input
            type="text"
            required
            placeholder="Например: Анна (Инстаграм)"
            value={modal.booking.clientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              modal.booking.setClientName(e.target.value)
            }
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700"
          />
        </div>

        {/* Телефон клиента */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Телефон клиента
          </label>
          <input
            type="tel"
            placeholder="+7 (999) 000-00-00"
            value={modal.booking.clientPhone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              modal.booking.setClientPhone(e.target.value)
            }
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700"
          />
        </div>

        {/* Селектор услуг */}
        <ServiceDropdown
          services={modal.booking.services}
          selectedService={modal.booking.selectedService}
          onSelectService={modal.booking.setSelectedService}
        />

        {/* Сетка Свободного Времени */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Выберите свободное время *
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100 scrollbar-none">
            {modal.availableSlots.length === 0 ? (
              <p className="col-span-4 text-center text-[11px] font-bold text-slate-400 py-4">
                Нет свободных окошек на этот день 🔒
              </p>
            ) : (
              modal.availableSlots.map((hour) => (
                <TimeSlotButton
                  key={hour}
                  hour={hour}
                  isSelected={modal.booking.selectedTime === hour}
                  onSelect={modal.booking.setSelectedTime}
                />
              ))
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="pt-2 flex space-x-2.5">
          <button
            type="button"
            onClick={modal.booking.handleClose}
            className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl border border-slate-200 transition-all text-sm active:scale-95"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={modal.booking.isSubmitting || !modal.booking.selectedTime}
            className={`w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm active:scale-95 ${
              modal.booking.isSubmitting || !modal.booking.selectedTime
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {modal.booking.isSubmitting ? 'Сохранение...' : 'Записать'}
          </button>
        </div>
      </form>

      {/* Шторка календаря */}
      <MonthCalendarSheet
        isOpen={modal.isCalendarOpen}
        onClose={() => modal.setIsCalendarOpen(false)}
        selectedDate={modal.currentDate}
        appointments={modal.appointments}
        onDateSelect={modal.handleSelectNewDate}
      />
    </div>
  );
}
