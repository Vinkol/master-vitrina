import { ServiceDropdown } from '../../components/admin/ServiceDropdown';
import { TimeSlotButton } from './TimeSlotButton';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import { MonthCalendarSheet } from '../../widgets/admin-calendar/MonthCalendarSheet';
import type { CountryCode } from '../../shared/lib/phone/phoneUtils';
import { useManualBooking } from './useManualBooking';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export function ManualBookingModal({ isOpen, onClose, selectedDate }: ManualBookingModalProps) {
  const modal = useManualBooking(selectedDate, onClose);

  const {
    clientName,
    handleNameChange,
    phoneBody,
    handlePhoneChange,
    selectedCountry,
    handleCountryChange,
    currentConfig,
    nameError,
    phoneError,
    isFormValid,
    isSubmitting,
    handleSave,
    setSelectedService,
    setSelectedTime,
    services,
    selectedService,
    selectedTime,
    availableSlots,
    currentDate,
    isCalendarOpen,
    setIsCalendarOpen,
    appointments,
    handleOpenCalendar,
    handleSelectNewDate,
    handleClose,
  } = modal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fadeIn">
      {/* Закрытие модалки при клике на фон */}
      <div className="absolute inset-0" onClick={handleClose} />

      <form
        onSubmit={(e) => {
          void handleSave(e);
        }}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto pb-10"
      >
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

        {/* Заголовок и Кнопка Календаря */}
        <div>
          <h4 className="text-base font-black text-slate-900">Записать клиента вручную</h4>
          <button
            type="button"
            onClick={handleOpenCalendar}
            className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-md inline-flex items-center space-x-1 mt-1.5 active:scale-95 transition-all cursor-pointer border border-indigo-100/40"
          >
            <span>📅 Дата: {formatToUserDate(currentDate)}</span>
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
            value={clientName}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${
              nameError
                ? 'border-rose-400 focus:border-rose-500 text-rose-700'
                : 'border-slate-200 focus:border-indigo-600 text-slate-700'
            }`}
          />
          {nameError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {nameError}</p>
          )}
        </div>

        {/* Телефон клиента */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Номер телефона *
          </label>
          <div className="flex space-x-2">
            {/* Селектор флагов */}
            <div className="relative shrink-0">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className="appearance-none bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 pr-8 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 h-full"
              >
                <option value="RU">🇷🇺 +7</option>
                <option value="BY">🇧🇾 +375</option>
                <option value="UA">🇺🇦 +380</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Инпут номера */}
            <input
              type="text"
              placeholder={currentConfig.placeholder}
              value={phoneBody}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${
                phoneError
                  ? 'border-rose-400 focus:border-rose-500 text-rose-700'
                  : 'border-slate-200 focus:border-indigo-600 text-slate-700'
              }`}
            />
          </div>
          {phoneError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {phoneError}</p>
          )}
        </div>

        {/* Селектор услуг */}
        <ServiceDropdown
          services={services}
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />

        {/* Сетка свободного времени */}
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
              availableSlots.map((hour) => (
                <TimeSlotButton
                  key={hour}
                  hour={hour}
                  isSelected={selectedTime === hour}
                  onSelect={setSelectedTime}
                />
              ))
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="pt-2 flex space-x-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl border border-slate-200 transition-all text-sm active:scale-95"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm active:scale-95 ${
              isSubmitting || !isFormValid
                ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400 border-transparent shadow-none'
                : ''
            }`}
          >
            {isSubmitting ? 'Сохранение...' : 'Записать'}
          </button>
        </div>
      </form>

      {/* Шторка календаря */}
      <MonthCalendarSheet
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={currentDate}
        appointments={appointments}
        onDateSelect={handleSelectNewDate}
      />
    </div>
  );
}
