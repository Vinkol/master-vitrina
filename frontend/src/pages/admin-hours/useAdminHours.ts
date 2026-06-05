import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import type { DaySchedule, TimeInterval } from '../../types';
import { haptic } from '../../shared/lib/haptic/haptic';

const defaultSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  day_index: i,
  is_working: i < 5,
  working_start: '10:00',
  working_end: '20:00',
  breaks: [],
}));

export function useAdminHours() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const updateProfileInDB = useBookingStore((state) => state.updateProfileInDB);
  const setScreen = useBookingStore((state) => state.setScreen);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const fromDB = masterProfile?.schedule;

    if (!fromDB || !Array.isArray(fromDB) || fromDB.length === 0) {
      return defaultSchedule;
    }

    return defaultSchedule.map((defaultDay, idx) => {
      const dbDay = fromDB.find((d) => d.day_index === idx);
      if (!dbDay) return defaultDay;

      return {
        ...defaultDay,
        ...dbDay,
        working_start: dbDay.working_start || defaultDay.working_start,
        working_end: dbDay.working_end || defaultDay.working_end,
        breaks: Array.isArray(dbDay.breaks) ? dbDay.breaks : defaultDay.breaks,
      };
    });
  });

  const updateDay = (dayIndex: number, fields: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d) => (d.day_index === dayIndex ? { ...d, ...fields } : d)));
  };

  const addBreak = (dayIndex: number) => {
    haptic.impact('light');
    const newBreak: TimeInterval = {
      id: crypto.randomUUID(),
      start: '13:00',
      end: '14:00',
    };
    setSchedule((prev) =>
      prev.map((d) => (d.day_index === dayIndex ? { ...d, breaks: [...d.breaks, newBreak] } : d)),
    );
  };

  const removeBreak = (dayIndex: number, breakId: string) => {
    haptic.impact('light');
    setSchedule((prev) =>
      prev.map((d) =>
        d.day_index === dayIndex ? { ...d, breaks: d.breaks.filter((b) => b.id !== breakId) } : d,
      ),
    );
  };

  const updateBreak = (dayIndex: number, breakId: string, fields: Partial<TimeInterval>) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day_index !== dayIndex) return d;
        return {
          ...d,
          breaks: d.breaks.map((b) => (b.id === breakId ? { ...b, ...fields } : b)),
        };
      }),
    );
  };

  const handleSave = async () => {
    haptic.impact('medium');
    setIsSaving(true);
    try {
      await updateProfileInDB({ schedule });
      setScreen('admin-dashboard');
    } catch (e) {
      console.error('Ошибка сохранения графика:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    masterProfile,
    schedule,
    isSaving,
    setScreen,
    updateDay,
    addBreak,
    removeBreak,
    updateBreak,
    handleSave,
  };
}
