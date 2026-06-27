import { useState, useMemo, useRef, useEffect } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useAppointments } from '../../features/appointments/useAppointments';
import type { Appointment, CalendarDay } from '../../types';
import { getTodayIsoString } from '../../shared/lib/calendar/dateHelpers';
import { haptic } from '../../shared/lib/haptic/haptic';
import { useServices } from '../../features/master/useServices';

function getDaysAroundDate(targetIso: string): CalendarDay[] {
  const target = new Date(targetIso);
  const start = new Date(target);
  start.setDate(start.getDate() - 30);

  const result: CalendarDay[] = [];
  const monthsRu = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const daysRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  for (let i = 0; i < 150; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const isoStr = `${year}-${month}-${day}`;

    result.push({
      isoDate: isoStr,
      dayOfMonth: current.getDate(),
      dayOfWeek: daysRu[current.getDay()],
      monthLabel: monthsRu[current.getMonth()],
    });
  }

  return result;
}

export function useAdminDashboard() {
  const setScreen = useBookingStore((state) => state.setScreen);
  const { appointments, isLoading: isAppointmentsLoading } = useAppointments();
  const { services, isLoading: isServicesLoading } = useServices();
  const todayIso = useMemo(() => getTodayIsoString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState<boolean>(false);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState<boolean>(false);
  const daysList = useMemo<CalendarDay[]>(() => {
    return getDaysAroundDate(selectedDate);
  }, [selectedDate]);

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
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const activeElem = scrollRef.current.querySelector('[data-active="true"]');
        if (activeElem) {
          activeElem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  const filteredAppointments = useMemo<Appointment[]>(() => {
    return appointments.filter((app) => app.date.split('T')[0] === selectedDate);
  }, [appointments, selectedDate]);

  const handleDaySelect = (isoDate: string): void => {
    haptic.impact('light');
    setSelectedDate(isoDate);
  };

  const handleMonthDateSelect = (isoDate: string): void => {
    haptic.impact('light');
    setSelectedDate(isoDate);
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
