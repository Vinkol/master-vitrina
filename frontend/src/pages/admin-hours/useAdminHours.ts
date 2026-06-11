import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import type { DaySchedule, TimeInterval } from '../../types';
import { haptic } from '../../shared/lib/haptic/haptic';

const defaultSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  day_index: i,
  day_id: i,
  day_name: `День ${i}`,
  is_working: i < 5,
  working_start: '10:00',
  start_time: '10:00',
  working_end: '20:00',
  end_time: '20:00',
  break_start: '',
  break_end: '',
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

    const cleanedSchedule = schedule.map((day) => ({
      day_id: day.day_index,
      day_name: String(day.day_name || `День ${day.day_index}`),
      start_time: day.working_start,
      end_time: day.working_end,
      break_start: day.break_start || '',
      break_end: day.break_end || '',

      // Старые ключи, которые требует тип DaySchedule на фронтенде
      day_index: day.day_index,
      is_working: day.is_working,
      working_start: day.working_start,
      working_end: day.working_end,
      breaks: day.breaks.map((brk) => ({
        id: brk.id,
        start: brk.start,
        end: brk.end,
      })),
    }));

    try {
      await updateProfileInDB({ schedule: cleanedSchedule });
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
