import { useState, useMemo, useRef, useEffect } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useAppointments } from '../../features/appointments/useAppointments'; // ИМПОРТ НАШЕГО ХУКА ЗАПИСЕЙ
import type { Appointment, CalendarDay } from '../../types';
import { getNextNDays, getTodayIsoString } from '../../shared/lib/calendar/dateHelpers';
import { haptic } from '../../shared/lib/haptic/haptic';
import { useServices } from '../../features/master/useServices';

export function useAdminDashboard() {
  const setScreen = useBookingStore((state) => state.setScreen);
  const { appointments, isLoading: isAppointmentsLoading } = useAppointments();
  const { services, isLoading: isServicesLoading } = useServices();

  const todayIso = useMemo(() => getTodayIsoString(), []);
  const daysList = useMemo<CalendarDay[]>(() => getNextNDays(), []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState<boolean>(false);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState<boolean>(false);

  const [visibleMonth, setVisibleMonth] = useState<string>(() => {
    const currentDayData = daysList.find((d) => d.isoDate === todayIso);
    return currentDayData ? currentDayData.monthLabel : 'Календарь';
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '0px -40% 0px -40%',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const month = entry.target.getAttribute('data-month');
          if (month) setVisibleMonth(month);
        }
      });
    }, observerOptions);

    const dayElements = scrollContainer.querySelectorAll('.day-tab-card');
    dayElements.forEach((el) => observer.observe(el));

    return () => {
      dayElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [daysList]);

  useEffect(() => {
    if (scrollRef.current) {
      const activeElem = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElem) {
        activeElem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const filteredAppointments = useMemo<Appointment[]>(() => {
    return appointments.filter((app) => app.date.split('T')[0] === selectedDate);
  }, [appointments, selectedDate]);

  const handleDaySelect = (isoDate: string): void => {
    haptic.impact('light');
    setSelectedDate(isoDate);
  };

  const handleMonthDateSelect = (isoDate: string): void => {
    setSelectedDate(isoDate);
    setTimeout(() => {
      const targetElem = scrollRef.current?.querySelector(`[data-date="${isoDate}"]`);
      targetElem?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 100);
  };

  return {
    appointments,
    services,
    isLoading: isAppointmentsLoading || isServicesLoading,
    setScreen,
    todayIso,
    daysList,
    selectedDate,
    isMonthModalOpen,
    setIsMonthModalOpen,
    isManualBookingOpen,
    setIsManualBookingOpen,
    visibleMonth,
    scrollRef,
    filteredAppointments,
    handleDaySelect,
    handleMonthDateSelect,
  };
}
