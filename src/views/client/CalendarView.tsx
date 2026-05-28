import { useState, useEffect, useRef, useMemo } from 'react';
import { useBookingStore } from '../../store/bookingStore';

// Константа-заглушка временных окошек (пока не внедрили генератор)
const MOCK_TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

interface CalendarDay {
  dayOfWeek: string;
  dayOfMonth: number;
  monthLabel: string;
  isoDate: string;
}

function getNext30Days(): CalendarDay[] {
  const days: CalendarDay[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
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

export function CalendarView() {
  const {
    selectedService,
    setScreen,
    setDate,
    setTime,
    selectedDate,
    selectedTime,
    currentRole,
    setRole,
  } = useBookingStore();

  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => getNext30Days(), []);

  const currentMonth = useMemo(() => {
    return days.find((d) => d.isoDate === selectedDate)?.monthLabel || days[0].monthLabel;
  }, [selectedDate, days]);

  const handleSelectDay = (isoDate: string) => {
    setDate(isoDate);
    setTimeSheetOpen(true);
  };

  const handleSelectTime = (slot: string) => {
    setTime(slot);
    setTimeSheetOpen(false);
  };

  // Логика управления нативной кнопкой Telegram (MainButton)
  useEffect(() => {
    const tgInstance = window.Telegram?.WebApp;

    if (tgInstance) {
      if (selectedDate && selectedTime && selectedService) {
        tgInstance.MainButton.text = `Записаться на ${selectedTime}`;
        tgInstance.MainButton.show();

        const handleMainButtonClick = () => {
          const clientName = tgInstance.initDataUnsafe?.user?.first_name || 'Дмитрий (ТГ)';

          // Отправляем запись в облако Supabase
          useBookingStore
            .getState()
            .createAppointment(clientName)
            .then(() => {
              tgInstance.showAlert(`Вы успешно записаны!`);
              // Если это был режим предпросмотра мастера — возвращаем его в админку
              if (currentRole === 'master') {
                setScreen('admin-placeholder-main');
              } else {
                setScreen('profile');
              }
            });

          tgInstance.MainButton.hide();
        };

        tgInstance.MainButton.onClick(handleMainButtonClick);

        return () => {
          tgInstance.MainButton.offClick(handleMainButtonClick);
        };
      } else {
        tgInstance.MainButton.hide();
      }
    }
  }, [selectedDate, selectedTime, selectedService, setScreen, currentRole]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn">
      {/* ПЛАШКА РЕЖИМА ПРЕДПРОСМОТРА (СЕНЬОР-UX) */}
      {currentRole === 'master' && (
        <div className="bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl flex justify-between items-center shadow-sm">
          <span>👀 Режим просмотра витрины</span>
          <button
            onClick={() => {
              // Возвращаем мастера обратно в его панель управления
              setRole('master');
              setScreen('admin-dashboard');
            }}
            className="bg-white text-amber-600 px-2.5 py-1 rounded-lg font-bold normal-case active:scale-95 transition-all shadow-xs"
          >
            Выйти
          </button>
        </div>
      )}

      {/* Шапка с кнопкой НАЗАД */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={() => {
            if (currentRole === 'master') {
              setRole('master');
              setScreen('admin-dashboard');
            } else {
              setScreen('profile');
            }
          }}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Выбор даты записи</h3>
          <p className="text-xs text-slate-400 line-clamp-1">
            Услуга: {selectedService?.title || 'Не выбрана (Тест)'}
          </p>
        </div>
      </div>

      {/* Горизонтальный Календарь-Лента */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Выберите день
          </h4>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md capitalize">
            {currentMonth}
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x scroll-smooth"
        >
          {days.map((day) => {
            const isSelected = selectedDate === day.isoDate;
            return (
              <div
                key={day.isoDate}
                onClick={() => handleSelectDay(day.isoDate)}
                className={`shrink-0 w-14 py-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all snap-center active:scale-95 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100 font-semibold'
                    : 'border-slate-100 bg-slate-50/60 text-slate-700 hover:border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] uppercase ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}
                >
                  {day.dayOfWeek}
                </span>
                <span className="text-base font-bold mt-0.5">{day.dayOfMonth}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Резюме выбора */}
      {selectedDate && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center text-sm animate-fadeIn">
          <span className="text-slate-500 font-medium">Выбранная дата:</span>
          <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
            {selectedDate} {selectedTime ? `в ${selectedTime}` : ''}
          </span>
        </div>
      )}

      {/* ПК Имитация Кнопки (если открыто в браузере) */}
      {!window.Telegram?.WebApp && selectedDate && selectedTime && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <button
            onClick={() => {
              useBookingStore
                .getState()
                .createAppointment('Дмитрий (Браузер)')
                .then(() => {
                  alert('Тестовая запись успешно улетела в Supabase!');
                  if (currentRole === 'master') {
                    setRole('master');
                    setScreen('admin-placeholder-main');
                  }
                });
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            [ПК] Подтвердить запись на {selectedTime}
          </button>
        </div>
      )}

      {/* ШТОРКА ВРЕМЕНИ */}
      {timeSheetOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setTimeSheetOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h4 className="text-sm font-bold text-slate-900 mb-4">
              Свободные окошки на {selectedDate}
            </h4>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {MOCK_TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSelectTime(slot)}
                  className={`py-3 px-2 text-sm font-semibold rounded-xl border transition-all active:scale-95 ${
                    selectedTime === slot
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTimeSheetOpen(false)}
              className="w-full bg-slate-50 text-slate-500 font-semibold py-3.5 rounded-xl border border-slate-200 transition-all text-sm"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
