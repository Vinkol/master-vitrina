import { useState, useMemo, useRef, useEffect } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { DashboardHeader } from '../../components/admin/DashboardHeader';
import { CalendarRibbon } from '../../components/admin/CalendarRibbon';
import { AppointmentRow } from '../../components/admin/AppointmentRow';
import { ManualBookingModal } from '../../features/manual-booking/ManualBookingModal';
import { MonthCalendarSheet } from '../../components/admin/MonthCalendarSheet';

import type { Appointment, CalendarDay } from '../../types';
import { haptic } from '../../utils/haptic';

function getNextNDays(count = 45): CalendarDay[] {
  const days: CalendarDay[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = -2; i < count; i++) {
    const activeDate = new Date(baseDate.getTime());
    activeDate.setDate(baseDate.getDate() + i);

    const year = activeDate.getFullYear();
    const month = String(activeDate.getMonth() + 1).padStart(2, '0');
    const day = String(activeDate.getDate()).padStart(2, '0');

    days.push({
      dayOfWeek: activeDate.toLocaleDateString('ru-RU', { weekday: 'short' }),
      dayOfMonth: activeDate.getDate(),
      monthLabel: activeDate.toLocaleDateString('ru-RU', { month: 'long' }),
      isoDate: `${year}-${month}-${day}`,
    });
  }
  return days;
}

export function AdminMainDashboardView() {
  const appointments = useBookingStore((state) => state.appointments);
  const setScreen = useBookingStore((state) => state.setScreen);

  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState<boolean>(false);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState<boolean>(false);

  const [visibleMonth, setVisibleMonth] = useState<string>(() => {
    const currentDayData = getNextNDays().find((d) => d.isoDate === todayIso);
    return currentDayData ? currentDayData.monthLabel : 'Календарь';
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const daysList = useMemo<CalendarDay[]>(() => getNextNDays(), []);

  // Трекинг прокрутки месяца (IntersectionObserver)
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

  // Автоскролл к выбранному дню
  useEffect(() => {
    if (scrollRef.current) {
      const activeElem = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElem) {
        activeElem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const filteredAppointments = useMemo<Appointment[]>(() => {
    return appointments.filter((app) => app.date === selectedDate);
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

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none">
      {/* ШАПКА */}
      <DashboardHeader
        visibleMonth={visibleMonth}
        onOpenMonthModal={() => {
          haptic.impact('medium');
          setIsMonthModalOpen(true);
        }}
      />

      {/* ЛЕНТА КАЛЕНДАРЯ */}
      <CalendarRibbon
        scrollRef={scrollRef}
        daysList={daysList}
        selectedDate={selectedDate}
        todayIso={todayIso}
        appointments={appointments}
        onDaySelect={handleDaySelect}
      />

      {/* 3. БЫСТРЫЕ ДЕЙСТВИЯ */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            haptic.impact('light');
            setIsManualBookingOpen(true);
          }}
          className="flex flex-col items-start p-4 bg-linear-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-sm active:scale-98 transition-all group"
        >
          <div className="p-2 bg-white/20 rounded-xl mb-3 text-lg">📝</div>
          <span className="text-xs font-black leading-tight">Записать вручную</span>
          <span className="text-[9px] text-indigo-100 mt-0.5">Клиент позвонил сам</span>
        </button>

        <button
          onClick={() => {
            haptic.impact('light');
            setScreen('admin-link-share');
          }}
          className="flex flex-col items-start p-4 bg-white border border-slate-200/80 text-slate-800 rounded-2xl shadow-xs active:scale-98 transition-all group"
        >
          <div className="p-2 bg-slate-100 rounded-xl mb-3 text-lg">🔗</div>
          <span className="text-xs font-black leading-tight">Ссылка на запись</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Поделиться витриной</span>
        </button>
      </div>

      {/* СПИСОК ЗАПИСЕЙ НА ДЕНЬ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Записи на {selectedDate === todayIso ? 'сегодня' : selectedDate}
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Всего: {filteredAppointments.length}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
            <span className="text-2xl mb-2">🍃</span>
            <p className="text-xs font-bold text-slate-400">На этот день записей нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map((app) => (
              <AppointmentRow key={app.id} appointment={app} />
            ))}
          </div>
        )}
      </div>

      {/* 5. НАТИВНЫЙ ИНТЕРАКТИВНЫЙ КАЛЕНДАРЬ НА МЕСЯЦ */}
      <MonthCalendarSheet
        isOpen={isMonthModalOpen}
        onClose={() => setIsMonthModalOpen(false)}
        selectedDate={selectedDate}
        appointments={appointments}
        onDateSelect={handleMonthDateSelect}
      />

      {/* ШТОРКА РУЧНОЙ ЗАПИСИ КЛИЕНТА */}
      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
