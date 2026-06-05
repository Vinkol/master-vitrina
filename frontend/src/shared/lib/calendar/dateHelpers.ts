import type { CalendarDay } from '../../../types';

export function getNextNDays(count = 45): CalendarDay[] {
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

export function getTodayIsoString(): string {
  const d = new Date();
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(d.getUTCDate()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDay}`;
}
