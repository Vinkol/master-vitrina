import { useState, useEffect, useRef } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { TimeSlotsSheet } from '../../components/client/TimeSlotsSheet';
import { haptic } from '../../shared/lib/haptic/haptic';
import { ClientCalendarRibbon } from '../../widgets/client-calendar/ClientCalendarRibbon';
import { api } from '../../shared/api/api';

export function CalendarView() {
  const {
    selectedService,
    setScreen,
    setDate,
    setTime,
    selectedDate,
    selectedTime,
    appointments,
    currentMasterId,
    goToConfirm,
  } = useBookingStore();

  const [timeSheetOpen, setTimeSheetOpen] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ЗАПРОС СЛОТОВ FASTAPI БЭКЕНДА
  useEffect(() => {
    if (!currentMasterId || !selectedDate || !selectedService) return;

    const fetchSlots = async () => {
      setIsSlotsLoading(true);
      try {
        const response = await api.get('/api/v1/appointments/slots', {
          params: {
            master_id: currentMasterId,
            target_date: selectedDate,
            duration_minutes: selectedService.duration,
            is_master: false,
          },
        });
        setAvailableSlots((response.data as string[]) || []);
      } catch (err) {
        console.error('Ошибка загрузки слотов с бэкенда:', err);
        setAvailableSlots([]);
      } finally {
        setIsSlotsLoading(false);
      }
    };

    void fetchSlots();
  }, [selectedDate, selectedService, currentMasterId]);

  const handleGoBack = (): void => {
    haptic.impact('light');
    setScreen('profile');
  };

  const handleSelectDay = (isoDate: string): void => {
    setDate(isoDate);
    setTimeSheetOpen(true);
  };

  const handleSelectTime = (slot: string): void => {
    setTime(slot);
    setTimeSheetOpen(false);
  };

  const handlePcNextStep = (): void => {
    haptic.impact('medium');
    goToConfirm();
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (selectedDate && selectedTime && selectedService) {
      tg.MainButton.text = 'Подтвердить';
      tg.MainButton.show();

      const handleMainButtonClick = () => {
        haptic.impact('medium');
        goToConfirm();
      };

      tg.MainButton.onClick(handleMainButtonClick);

      return () => {
        tg.MainButton.offClick(handleMainButtonClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [selectedDate, selectedTime, selectedService, goToConfirm]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn">
      {/* ХЕДЕР С КНОПКОЙ НАЗАД */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h3 className="font-black text-slate-800 text-sm">Выбор даты записи</h3>
          <p className="text-xs text-slate-400 line-clamp-1 font-medium">
            Услуга: {selectedService?.title || 'Не выбрана (Тест)'}
          </p>
        </div>
      </div>

      {/* ЛЕНТА КАЛЕНДАРЯ */}
      <ClientCalendarRibbon
        scrollRef={scrollRef}
        selectedDate={selectedDate}
        appointments={appointments}
        onSelectDay={handleSelectDay}
      />

      {/* КНОПКА ДЛЯ ТЕСТОВ НА ПК */}
      {!window.Telegram?.WebApp?.initData && selectedDate && selectedTime && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <button
            onClick={handlePcNextStep}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            Подтвердить время {selectedTime} →
          </button>
        </div>
      )}

      {/* ШТОРКА ВЫБОРА СЛОТОВ ВРЕМЕНИ */}
      <TimeSlotsSheet
        isOpen={timeSheetOpen}
        onClose={() => setTimeSheetOpen(false)}
        selectedDate={selectedDate}
        availableSlots={availableSlots}
        selectedTime={selectedTime}
        onSelectTime={handleSelectTime}
        isLoading={isSlotsLoading}
      />
    </div>
  );
}
