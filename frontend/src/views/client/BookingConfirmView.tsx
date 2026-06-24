import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../shared/lib/haptic/haptic';
import { COUNTRY_CONFIGS, type CountryCode } from '../../shared/lib/phone/phoneUtils';
import { useBookingForm } from '../../features/manual-booking/useBookingForm';
import { useTelegramMainButton } from '../../features/manual-booking/useTelegramMainButton';
import { BookingDetailsCard } from '../../components/client/BookingDetailsCard';

export function BookingConfirmView() {
  const { selectedService, selectedDate, selectedTime, setScreen } = useBookingStore();

  const form = useBookingForm();

  useTelegramMainButton({
    isFormValid: form.isFormValid,
    buttonText: 'Подтвердить запись',
    onClick: () => form.handleConfirmBooking(form.name, form.fullRawPhone),
  });

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn">
      {/* ХЕДЕР */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={() => {
            haptic.impact('light');
            setScreen('calendar');
          }}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <h3 className="font-black text-slate-800 text-sm">Подтверждение записи</h3>
      </div>

      {/* ДЕТАЛИ ВИЗИТА */}
      <BookingDetailsCard service={selectedService} date={selectedDate} time={selectedTime} />

      {/* ФОРМА ВВОДА */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={form.name}
            onChange={(e) => form.handleNameChange(e.target.value)}
            className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${form.nameError ? 'border-rose-400 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-indigo-600 text-slate-700'}`}
          />
          {form.nameError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {form.nameError}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Номер телефона *
          </label>
          <div className="flex space-x-2">
            <div className="relative shrink-0">
              <select
                value={form.selectedCountry}
                onChange={(e) => form.handleCountryChange(e.target.value as CountryCode)}
                className="appearance-none bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 pr-8 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 h-full"
              >
                {Object.values(COUNTRY_CONFIGS).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.prefix}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            <input
              type="text"
              placeholder={form.currentConfig.placeholder}
              value={form.phoneBody}
              onChange={(e) => form.handlePhoneChange(e.target.value)}
              className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${form.phoneError ? 'border-rose-400 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-indigo-600 text-slate-700'}`}
            />
          </div>
          {form.phoneError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {form.phoneError}</p>
          )}
        </div>
      </div>

      {/* КНОПКА ДЛЯ ПК ВЕРСИИ */}
      {!window.Telegram?.WebApp?.initData && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <button
            onClick={() => void form.handleConfirmBooking(form.name, form.fullRawPhone)}
            disabled={form.isSubmitting || !form.isFormValid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            {form.isSubmitting ? 'Сохранение...' : 'Записаться онлайн'}
          </button>
        </div>
      )}
    </div>
  );
}
