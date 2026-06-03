import { useState, useMemo } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import type { Service } from '../../types';
import { haptic } from '../../utils/haptic';

export function useMainView() {
  const services = useBookingStore((state) => state.services);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const selectService = useBookingStore((state) => state.selectService);

  const [activeBottomSheet, setActiveBottomSheet] = useState<Service | null>(null);

  const workingHoursLabel = useMemo<string>(() => {
    if (!masterProfile?.schedule?.length) return '10:00 — 20:00';

    const d = new Date();
    const jsDay = d.getUTCDay();
    const dbDayIndex = jsDay === 0 ? 6 : jsDay - 1;

    const currentDayConfig = masterProfile.schedule.find((day) => day.day_index === dbDayIndex);

    if (!currentDayConfig || !currentDayConfig.is_working) {
      return 'Сегодня выходной';
    }

    const start = currentDayConfig.working_start?.substring(0, 5) || '10:00';
    const end = currentDayConfig.working_end?.substring(0, 5) || '20:00';

    return `${start} — ${end}`;
  }, [masterProfile]);

  const handleOpenDetail = (service: Service) => {
    haptic.impact('light');
    setActiveBottomSheet(service);
  };

  const handleSelectService = (service: Service) => {
    haptic.impact('medium');
    selectService(service);
    setActiveBottomSheet(null);
  };

  return {
    services,
    masterProfile,
    workingHoursLabel,
    activeBottomSheet,
    setActiveBottomSheet,
    handleOpenDetail,
    handleSelectService,
  };
}
