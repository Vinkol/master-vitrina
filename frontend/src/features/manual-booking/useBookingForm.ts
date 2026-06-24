import { useState, useCallback } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../shared/lib/haptic/haptic';
import {
  COUNTRY_CONFIGS,
  formatPhoneBody,
  validateCngName,
  type CountryCode,
} from '../../shared/lib/phone/phoneUtils';

export function useBookingForm() {
  const { setScreen } = useBookingStore();

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
        setScreen('booking-success');
      } catch (err) {
        console.error('Ошибка бронирования:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isFormValid, setScreen],
  );

  return {
    name,
    phoneBody,
    selectedCountry,
    isSubmitting,
    nameError,
    phoneError,
    currentConfig,
    fullRawPhone,
    isFormValid,
    handleNameChange,
    handlePhoneChange,
    handleCountryChange,
    handleConfirmBooking,
  };
}
