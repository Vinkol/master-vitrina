import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';
import { haptic } from '../../shared/lib/haptic/haptic';
import { api } from '../../shared/api/api';
import {
  formatPhoneBody,
  validateCngName,
  COUNTRY_CONFIGS,
  type CountryCode,
} from '../../shared/lib/phone/phoneUtils';
import { generateAvailableSlots } from '../slot-generation/slotGenerator';

export function useManualBooking(selectedDate: string, onClose: () => void) {
  const queryClient = useQueryClient();
  const { services, currentMasterId, appointments, masterProfile } = useBookingStore();
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phoneBody, setPhoneBody] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('RU');
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // РАСЧЕТ СВОБОДНЫХ ОКОШЕК
  const availableSlots = useMemo<string[]>(() => {
    if (!selectedService || !currentMasterId || !masterProfile?.schedule) return [];
    const pureDate = selectedDate.split('T')[0];
    const jsDayIdx = new Date(pureDate).getDay();
    const targetDayIndex = jsDayIdx === 0 ? 6 : jsDayIdx - 1;

    const daySchedule = masterProfile.schedule.find((s) => s.day_index === targetDayIndex);
    if (!daySchedule || !daySchedule.is_working) return [];

    return generateAvailableSlots({
      selectedDate: pureDate,
      daySchedule,
      selectedService,
      appointments: appointments || [],
      isMaster: true,
      slotStepMinutes: masterProfile?.slot_step || 30,
    });
  }, [selectedDate, selectedService, appointments, masterProfile, currentMasterId]);

  const currentConfig = COUNTRY_CONFIGS[selectedCountry];
  const fullRawPhone = `${currentConfig.prefix}${phoneBody.replace(/\D/g, '')}`;

  const totalDigitsInPhone = fullRawPhone.replace(/\D/g, '').length;
  const isFormValid =
    clientName.trim().length >= 2 &&
    !nameError &&
    totalDigitsInPhone === currentConfig.digitsCount &&
    !phoneError &&
    selectedService &&
    selectedTime;

  const handleOpen = () => {
    haptic.impact('light');
    setClientName('');
    setPhoneBody('');
    setNameError(null);
    setPhoneError(null);
    setSelectedService(services[0] || null);
    setSelectedTime('');
    setIsOpen(true);
  };

  const handleClose = () => {
    haptic.impact('light');
    setIsOpen(false);
    onClose();
  };

  const handleNameChange = (val: string) => {
    const capitalized = val
      .toLowerCase()
      .replace(/(^|\s|-)[a-zа-яё]/g, (char) => char.toUpperCase());

    setClientName(capitalized);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !currentMasterId || !selectedService) return;

    haptic.impact('medium');
    setIsSubmitting(true);

    try {
      const appointmentPayload = {
        master_id: currentMasterId,
        service_id: selectedService.id,
        date: selectedDate.split('T')[0],
        time: selectedTime,
        client_name: clientName.trim(),
        client_phone: fullRawPhone,
      };

      await api.post('/api/v1/appointments', appointmentPayload);
      void queryClient.invalidateQueries({ queryKey: ['appointments', currentMasterId] });
      void queryClient.invalidateQueries({ queryKey: ['crm-clients'] });

      setClientName('');
      setPhoneBody('');
      setSelectedTime('');

      onClose();
    } catch (err) {
      console.error('Ошибка ручного добавления записи:', err);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('Не удалось сохранить запись на сервере.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
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
    selectedService,
    setSelectedService,
    selectedTime,
    setSelectedTime,
    availableSlots,
    isSubmitting,
    handleOpen,
    handleClose,
    handleSave,
    services,
  };
}
