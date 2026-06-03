import { useState, useEffect, useRef, useMemo } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { generateAvailableSlots } from '../../features/slot-generation/slotGenerator';
import { PreviewModeBanner } from '../../components/client/PreviewModeBanner';
import { ClientCalendarRibbon } from '../../components/client/ClientCalendarRibbon';
import { TimeSlotsSheet } from '../../components/client/TimeSlotsSheet';
import { haptic } from '../../utils/haptic';
import type { BookingState } from '../../store/types';

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

  const masterProfile = useBookingStore((state: BookingState) => state.masterProfile);
  const appointments = useBookingStore((state: BookingState) => state.appointments);

  const [timeSheetOpen, setTimeSheetOpen] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const availableSlots = useMemo<string[]>(() => {
    if (!masterProfile?.schedule || !selectedService || !selectedDate) return [];

    const jsDay = new Date(selectedDate).getDay();
    const dbDayIndex = jsDay === 0 ? 6 : jsDay - 1;

    const daySchedule = masterProfile.schedule.find((d) => d.day_index === dbDayIndex);
    if (!daySchedule) return [];

    return generateAvailableSlots({
      selectedDate,
      daySchedule,
      selectedService,
      appointments: appointments,
      isMaster: false,
    });
  }, [selectedDate, selectedService, masterProfile, appointments]);

  const tgInstance = window.Telegram?.WebApp;
  const currentTgId = tgInstance?.initDataUnsafe?.user?.id;
  const masterTelegramId = masterProfile?.telegram_id;

  const isPreviewMode =
    !tgInstance ||
    (currentTgId && masterTelegramId && Number(currentTgId) === Number(masterTelegramId));

  const handleSelectDay = (isoDate: string): void => {
    setDate(isoDate);
    setTimeSheetOpen(true);
  };

  const handleSelectTime = (slot: string): void => {
    setTime(slot);
    setTimeSheetOpen(false);
  };

  const handleExitPreview = (): void => {
    setScreen('admin-dashboard');
    setRole('master');
  };

  const handleGoBack = (): void => {
    haptic.impact('light');
    if (currentRole === 'master') {
      setRole('master');
      setScreen('admin-dashboard');
    } else {
      setScreen('profile');
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (selectedDate && selectedTime && selectedService) {
      tg.MainButton.text = `Записаться на ${selectedTime}`;
      tg.MainButton.show();

      const handleMainButtonClick = () => {
        const clientName = tg.initDataUnsafe?.user?.first_name || 'Дмитрий (ТГ)';
        tg.MainButton.showProgress();

        void (async () => {
          try {
            await useBookingStore.getState().createAppointment(clientName);
            haptic.notification('success');
            if (tg.showAlert) tg.showAlert(`Вы успешно записаны!`);

            if (currentRole === 'master') {
              setScreen('admin-placeholder-main');
            } else {
              setScreen('profile');
            }
          } catch {
            if (tg.showAlert) tg.showAlert('Произошла ошибка при создании записи');
          } finally {
            tg.MainButton.hideProgress();
            tg.MainButton.hide();
          }
        })();
      };

      tg.MainButton.onClick(handleMainButtonClick);

      return () => {
        tg.MainButton.offClick(handleMainButtonClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [selectedDate, selectedTime, selectedService, setScreen, currentRole]);

  // Синхронный обработчик для ПК
  const handlePcSubmit = () => {
    void (async () => {
      try {
        await useBookingStore.getState().createAppointment('Дмитрий (Браузер)');
        haptic.notification('success');
        alert('Тестовая запись успешно улетела в Supabase!');
        if (currentRole === 'master') {
          setRole('master');
          setScreen('admin-placeholder-main');
        }
      } catch {
        alert('Ошибка при отправке записи');
      }
    })();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24 relative select-none animate-fadeIn">
      <PreviewModeBanner isPreviewMode={!!isPreviewMode} onExitPreview={handleExitPreview} />

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

      <ClientCalendarRibbon
        scrollRef={scrollRef}
        selectedDate={selectedDate}
        appointments={appointments}
        onSelectDay={handleSelectDay}
      />

      {!window.Telegram?.WebApp && selectedDate && selectedTime && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <button
            onClick={handlePcSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            [ПК] Подтвердить запись на {selectedTime}
          </button>
        </div>
      )}

      <TimeSlotsSheet
        isOpen={timeSheetOpen}
        onClose={() => setTimeSheetOpen(false)}
        selectedDate={selectedDate}
        availableSlots={availableSlots}
        selectedTime={selectedTime}
        onSelectTime={handleSelectTime}
      />
    </div>
  );
}
