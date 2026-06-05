import { useState, useMemo } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useManualBooking } from './useManualBooking';
import { generateAvailableSlots } from '../slot-generation/slotGenerator';
import { haptic } from '../../shared/lib/haptic/haptic';

export function useManualBookingModal(initialDate: string, onClose: () => void) {
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const booking = useManualBooking(currentDate, onClose);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const appointments = useBookingStore((state) => state.appointments);

  const availableSlots = useMemo<string[]>(() => {
    if (!masterProfile?.schedule || !booking.selectedService || !currentDate) return [];

    const jsDay = new Date(currentDate).getDay();
    const dbDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const daySchedule = masterProfile.schedule.find((d) => d.day_index === dbDayIndex);
    if (!daySchedule) return [];

    return generateAvailableSlots({
      selectedDate: currentDate,
      daySchedule,
      selectedService: booking.selectedService,
      appointments,
      isMaster: true,
    });
  }, [currentDate, booking.selectedService, masterProfile, appointments]);

  const handleOpenCalendar = () => {
    haptic.impact('light');
    setIsCalendarOpen(true);
  };

  const handleSelectNewDate = (isoDate: string) => {
    setCurrentDate(isoDate);
    setIsCalendarOpen(false);
    booking.setSelectedTime('');
  };

  return {
    currentDate,
    isCalendarOpen,
    setIsCalendarOpen,
    booking,
    appointments,
    availableSlots,
    handleOpenCalendar,
    handleSelectNewDate,
  };
}
