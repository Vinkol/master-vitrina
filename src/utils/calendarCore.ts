export interface CalendarGridDay {
  dayNumber: number | null;
  isoDate: string | null;
}

export interface MonthGridResult {
  monthName: string;
  days: CalendarGridDay[];
}

export function generateMonthGrid(year: number, monthIdx: number): MonthGridResult {
  const targetDate = new Date(year, monthIdx, 1);
  const actualYear = targetDate.getFullYear();
  const actualMonth = targetDate.getMonth();
  const monthName = targetDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(actualYear, actualMonth + 1, 0).getDate();

  // Вычисляем день недели для 1-го числа. Сдвигаем индекс, чтобы Пн стал 0
  let startDayOfWeek = targetDate.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: CalendarGridDay[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ dayNumber: null, isoDate: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const stringMonth = String(actualMonth + 1).padStart(2, '0');
    const stringDay = String(d).padStart(2, '0');

    days.push({
      dayNumber: d,
      isoDate: `${actualYear}-${stringMonth}-${stringDay}`,
    });
  }

  return { monthName, days };
}
