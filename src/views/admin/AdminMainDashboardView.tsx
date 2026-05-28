import { useState, useMemo, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import type { Appointment, CalendarDay } from '../../types';

// Генерируем правильную сетку дней с жесткой привязкой к текущей дате
function getNextNDays(count = 45): CalendarDay[] {
  const days: CalendarDay[] = [];

  // Берем текущую дату на клиенте
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0); // Обнуляем время, чтобы избежать сдвигов из-за часовых поясов

  for (let i = -2; i < count; i++) {
    const activeDate = new Date(baseDate.getTime());
    activeDate.setDate(baseDate.getDate() + i);

    // Получаем год, месяц и день вручную, чтобы собрать чистый ISO "YYYY-MM-DD" без искажения таймзоной
    const year = activeDate.getFullYear();
    const month = String(activeDate.getMonth() + 1).padStart(2, '0');
    const day = String(activeDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    days.push({
      dayOfWeek: activeDate.toLocaleDateString('ru-RU', { weekday: 'short' }), // "Пн", "Вт"...
      dayOfMonth: activeDate.getDate(), // 1, 2, 3...
      monthLabel: activeDate.toLocaleDateString('ru-RU', { month: 'long' }), // "май", "июнь"...
      isoDate: isoDate,
    });
  }
  return days;
}

export function AdminMainDashboardView() {
  const appointments = useBookingStore((state) => state.appointments);
  const setScreen = useBookingStore((state) => state.setScreen);

  // Сегодняшняя дата в чистом формате YYYY-MM-DD
  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState<boolean>(false);
  const [visibleMonth, setVisibleMonth] = useState<string>(() => {
    const currentDayData = getNextNDays().find((d) => d.isoDate === todayIso);
    return currentDayData ? currentDayData.monthLabel : 'Календарь';
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const daysList = useMemo<CalendarDay[]>(() => getNextNDays(), []);

  // ДИНАМИЧЕСКИЙ ТРЕКИНГ МЕСЯЦА ПРИ СКРОЛЛЕ (IntersectionObserver)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '0px -40% 0px -40%', // Сужаем зону видимости до центра экрана
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Проверяем intersecting только для тех элементов, которые реально в центре
        if (entry.isIntersecting) {
          const month = entry.target.getAttribute('data-month');
          if (month) {
            setVisibleMonth(month); // Это легитимный вызов внутри асинхронного колбэка события
          }
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

  // Авто-скролл к сегодняшней / выбранной дате при старте
  useEffect(() => {
    if (scrollRef.current) {
      const activeElem = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElem) {
        activeElem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' = 'light'): void => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const filteredAppointments = useMemo<Appointment[]>(() => {
    return appointments.filter((app) => app.date === selectedDate);
  }, [appointments, selectedDate]);

  const handleDaySelect = (isoDate: string): void => {
    triggerHaptic('light');
    setSelectedDate(isoDate);
  };

  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
      setIsMonthModalOpen(false);
      triggerHaptic('medium');

      // Сразу перемещаем скролл ленты к выбранной из календаря дате
      setTimeout(() => {
        const targetElem = scrollRef.current?.querySelector(`[data-date="${e.target.value}"]`);
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* ВЕРХНЯЯ ПАНЕЛЬ: Отображает visibleMonth (тот месяц, который прямо сейчас видит пользователь в ленте) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Расписание записей
          </span>
          <h2 className="text-base font-black text-slate-800 capitalize mt-0.5">
            {visibleMonth || 'Календарь'}
          </h2>
        </div>
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsMonthModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all active:scale-95 text-xs font-bold"
        >
          <span>📅</span>
          <span>Весь месяц</span>
        </button>
      </div>

      {/* ГОРИЗОНТАЛЬНЫЙ КАЛЕНДАРЬ С УМНЫМ ТРЕКИНГОМ */}
      <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 space-y-2">
        <div
          ref={scrollRef}
          className="flex space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {daysList.map((day) => {
            const isSelected = selectedDate === day.isoDate;
            const isToday = day.isoDate === todayIso;
            const hasAppointments = appointments.some((app) => app.date === day.isoDate);

            return (
              <div
                key={day.isoDate}
                data-date={day.isoDate}
                data-month={day.monthLabel}
                data-active={isSelected}
                onClick={() => handleDaySelect(day.isoDate)}
                className={`day-tab-card shrink-0 w-14 py-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all snap-center relative active:scale-95 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
                    : isToday
                      ? 'border-indigo-200 bg-indigo-50/40 text-indigo-600 font-semibold'
                      : 'border-slate-100 bg-slate-50/60 text-slate-700 hover:border-slate-200'
                }`}
              >
                <span
                  className={`text-[9px] uppercase tracking-wide ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}
                >
                  {day.dayOfWeek}
                </span>
                <span className="text-base font-black mt-0.5">{day.dayOfMonth}</span>

                {hasAppointments && !isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* БЫСТРЫЕ ДЕЙСТВИЯ */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => alert(`Добавление записи вручную на дату: ${selectedDate}`)}
          className="flex flex-col items-start p-4 bg-linear-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-sm hover:opacity-95 active:scale-98 transition-all group"
        >
          <div className="p-2 bg-white/20 rounded-xl mb-3 text-lg transition-transform group-hover:scale-110">
            📝
          </div>
          <span className="text-xs font-black leading-tight">Записать вручную</span>
          <span className="text-[9px] text-indigo-100 mt-0.5">Клиент позвонил сам</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setScreen('admin-link-share');
          }}
          className="flex flex-col items-start p-4 bg-white border border-slate-200/80 text-slate-800 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-98 transition-all group"
        >
          <div className="p-2 bg-slate-100 rounded-xl mb-3 text-lg transition-transform group-hover:scale-110">
            🔗
          </div>
          <span className="text-xs font-black leading-tight">Ссылка на запись</span>
          <span className="text-[9px] text-slate-400 mt-0.5">Поделиться витриной</span>
        </button>
      </div>

      {/* СПИСОК ЗАПИСЕЙ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Записи на{' '}
            {selectedDate === new Date().toISOString().split('T')[0] ? 'сегодня' : selectedDate}
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
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl text-center min-w-13.75 border border-slate-100">
                    <span className="text-sm font-black text-slate-800 block">{app.time}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{app.client_name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Услуга: {app.service_title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ШТОРКА КАЛЕНДАРЯ */}
      {isMonthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setIsMonthModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-black text-slate-900">Выбор даты на весь monthLabel</h4>
            </div>
            <div className="p-2 border border-slate-100 rounded-xl bg-slate-50 mb-6">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateInputChange}
                className="w-full bg-transparent p-3 font-bold text-sm focus:outline-none text-slate-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
