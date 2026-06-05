import { useState, useEffect, useCallback } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../shared/lib/haptic/haptic';
import { formatToUserDate } from '../../shared/lib/calendar/dateFormatter';
import {
  formatPhoneBody,
  validateCngName,
  COUNTRY_CONFIGS,
  type CountryCode,
} from '../../shared/lib/phone/phoneUtils';

export function BookingConfirmView() {
  const { selectedService, selectedDate, selectedTime, setScreen, resetBooking } =
    useBookingStore();

  const [name, setName] = useState<string>('');
  const [phoneBody, setPhoneBody] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('RU');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const currentConfig = COUNTRY_CONFIGS[selectedCountry];
  const fullRawPhone = `${currentConfig.prefix}${phoneBody.replace(/\D/g, '')}`;

  const totalDigitsInPhone = fullRawPhone.replace(/\D/g, '').length;
  const isFormValid =
    name.trim().length >= 2 &&
    !nameError &&
    totalDigitsInPhone === currentConfig.digitsCount &&
    !phoneError;

  const handleGoBack = () => {
    haptic.impact('light');
    setScreen('calendar');
  };

  const handleNameChange = (val: string) => {
    const capitalized = val
      .toLowerCase()
      .replace(/(^|\s|-)[a-zа-яё]/g, (char) => char.toUpperCase());

    setName(capitalized);
    if (capitalized.trim() && !validateCngName(capitalized)) {
      setNameError('Имя может содержать только буквы');
    } else if (capitalized.trim() && capitalized.trim().length < 2) {
      setNameError('Имя слишком короткое');
    } else {
      setNameError(null);
    }
  };

  const handlePhoneChange = (val: string) => {
    const formattedBody = formatPhoneBody(val, selectedCountry);
    setPhoneBody(formattedBody);

    const pureDigits = formattedBody.replace(/\D/g, '');
    const requiredBodyLength =
      currentConfig.digitsCount - currentConfig.prefix.replace(/\D/g, '').length;

    if (pureDigits.length > 0 && pureDigits.length < requiredBodyLength) {
      setPhoneError('Неполный номер телефона');
    } else {
      setPhoneError(null);
    }
  };

  // Переключение страны в выпадающем списке
  const handleCountryChange = (country: CountryCode) => {
    haptic.impact('light');
    setSelectedCountry(country);
    setPhoneBody('');
    setPhoneError(null);
  };

  const handleConfirmBooking = useCallback(
    async (clientName: string, finalPhone: string) => {
      if (!isFormValid) return;

      setIsSubmitting(true);
      try {
        await useBookingStore.getState().createAppointment(clientName.trim(), finalPhone);
        haptic.notification('success');

        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(`🎉 Вы успешно записаны!`);
        } else {
          alert(`🎉 Вы успешно записаны!`);
        }
        resetBooking();
      } catch (err) {
        console.error('Ошибка бронирования:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isFormValid, resetBooking],
  );

  // ГЛАВНАЯ КНОПКА ТЕЛЕГРАМА
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (isFormValid) {
      tg.MainButton.text = 'Подтвердить запись';
      tg.MainButton.show();

      const handleMainButtonClick = () => {
        tg.MainButton.showProgress();
        void (async () => {
          await handleConfirmBooking(name, fullRawPhone);
          tg.MainButton.hideProgress();
          tg.MainButton.hide();
        })();
      };

      tg.MainButton.onClick(handleMainButtonClick);

      return () => {
        tg.MainButton.offClick(handleMainButtonClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [name, fullRawPhone, isFormValid, handleConfirmBooking]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn">
      {/* ХЕДЕР */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <h3 className="font-black text-slate-800 text-sm">Подтверждение записи</h3>
      </div>

      {/* РЕЗЮМЕ ЗАПИСИ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Детали вашего визита
        </h4>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700">
            ✂️ Услуга: <span className="text-indigo-600">{selectedService?.title}</span>
          </p>
          <p className="text-xs text-slate-500 font-medium">
            ⏱ Длительность: {selectedService?.duration} мин · Цена: {selectedService?.price} ₽
          </p>
          <div className="h-px bg-slate-100 my-2" />
          <p className="text-sm font-bold text-slate-700">
            📅 Дата: {selectedDate ? formatToUserDate(selectedDate) : ''}
          </p>
          <p className="text-sm font-bold text-slate-700">
            🕒 Время: <span className="text-indigo-600 font-black">{selectedTime}</span>
          </p>
        </div>
      </div>

      {/* ФОРМА ВВОДА С СЕЛЕКТОРОМ СТРАН */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-left">
        {/* ИНПУТ ИМЕНИ */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${nameError ? 'border-rose-400 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-indigo-600 text-slate-700'}`}
          />
          {nameError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {nameError}</p>
          )}
        </div>

        {/* СЛИТНЫЙ ИНПУТ ТЕЛЕФОНА С ВЫБОРОМ ФЛАГА */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Номер телефона *
          </label>
          <div className="flex space-x-2">
            {/* ВЫПАДАЮЩИЙ СПИСОК СТРАН */}
            <div className="relative shrink-0">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className="appearance-none bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 pr-8 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 h-full"
              >
                {Object.values(COUNTRY_CONFIGS).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.prefix}
                  </option>
                ))}
              </select>
              {/* Кастомная маленькая стрелочка для красоты селекта */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* ИНПУТ ДЛЯ ТЕЛА НОМЕРА */}
            <input
              type="text"
              placeholder={currentConfig.placeholder}
              value={phoneBody}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`w-full p-3.5 rounded-xl border focus:outline-none text-sm bg-slate-50/50 font-bold ${phoneError ? 'border-rose-400 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:border-indigo-600 text-slate-700'}`}
            />
          </div>
          {phoneError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">⚠️ {phoneError}</p>
          )}
        </div>
      </div>

      {/* КНОПКА ДЛЯ ПК ВЕРСИИ */}
      {!window.Telegram?.WebApp?.initData && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <button
            onClick={() => {
              void handleConfirmBooking(name, fullRawPhone);
            }}
            disabled={isSubmitting || !isFormValid} // Обновили валидацию кнопки
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            {isSubmitting ? 'Сохранение...' : 'Записаться онлайн'}
          </button>
        </div>
      )}
    </div>
  );
}
