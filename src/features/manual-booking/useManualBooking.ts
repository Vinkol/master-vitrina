import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';
import { haptic } from '../../utils/haptic';

export function useManualBooking(selectedDate: string, onClose: () => void) {
  const { services, currentMasterId, fetchAppointments, fetchCrmClients } = useBookingStore();
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    haptic.impact('light');
    setClientName('');
    setClientPhone('');
    setSelectedService(services[0] || null);
    setIsOpen(true);
  };

  const handleClose = () => {
    haptic.impact('light');
    setIsOpen(false);
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !selectedService || !selectedTime || !currentMasterId) return;

    haptic.impact('medium');
    setIsSubmitting(true);

    try {
      const cleanPhone = clientPhone.trim();
      const formattedPhone = cleanPhone.startsWith('+')
        ? '+' + cleanPhone.replace(/\D/g, '')
        : cleanPhone.replace(/\D/g, '');

      const newAppointment = {
        master_tg_id: currentMasterId,
        service_title: selectedService.title,
        date: selectedDate,
        time: selectedTime,
        client_name: clientName.trim(),
        client_phone: formattedPhone || 'Телефон не указан',
      };

      const { supabase } = await import('../../../supabaseClient');
      const { error } = await supabase.from('appointments').insert([newAppointment]);
      if (error) throw error;

      await Promise.all([fetchAppointments(), fetchCrmClients()]);

      setClientName('');
      setClientPhone('');
      setSelectedTime('');

      onClose();
    } catch (err) {
      console.error('Ошибка ручного добавления записи:', err);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert('Не удалось сохранить запись. Попробуйте снова.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    selectedService,
    setSelectedService,
    selectedTime,
    setSelectedTime,
    isSubmitting,
    handleOpen,
    handleClose,
    handleSave,
    services,
  };
}
