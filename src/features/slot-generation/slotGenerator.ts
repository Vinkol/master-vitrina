import type { DaySchedule, Appointment, Service } from '../../types';

interface GeneratorOptions {
  selectedDate: string; // "YYYY-MM-DD"
  daySchedule: DaySchedule; // Настройки конкретного дня из профиля
  selectedService: Service; // Выбранная услуга (нужна её duration)
  appointments: Appointment[]; // Все записи мастера
  slotStepMinutes?: number; // Шаг сетки (по умолчанию каждые 30 минут)
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateAvailableSlots({
  selectedDate,
  daySchedule,
  selectedService,
  appointments,
  slotStepMinutes = 30,
}: GeneratorOptions): string[] {
  // Если день выходной — окошек нет
  if (!daySchedule.is_working) return [];

  const availableSlots: string[] = [];
  const workStart = timeToMinutes(daySchedule.working_start);
  const workEnd = timeToMinutes(daySchedule.working_end);
  const serviceDuration = selectedService.duration;

  // Фильтруем записи из базы строго на выбранный день
  const dayAppointments = appointments.filter((app) => app.date === selectedDate);

  // Генерируем слоты. Окошко не может начаться позже, чем "конец дня минус длительность услуги"
  for (let current = workStart; current + serviceDuration <= workEnd; current += slotStepMinutes) {
    const slotStart = current;
    const slotEnd = current + serviceDuration;

    let isInterrupted = false;

    // Проверка: Пересечение с перерывами мастера
    if (daySchedule.breaks && daySchedule.breaks.length > 0) {
      for (const brk of daySchedule.breaks) {
        const breakStart = timeToMinutes(brk.start);
        const breakEnd = timeToMinutes(brk.end);

        if (slotStart < breakEnd && slotEnd > breakStart) {
          isInterrupted = true;
          break;
        }
      }
    }

    if (isInterrupted) continue;

    // Проверка: Пересечение с существующими записями в БД
    for (const app of dayAppointments) {
      const appStart = timeToMinutes(app.time);

      // Так как у нас в appointments хранится только service_title,
      // заложим дефолтную длительность записи (60 мин) для изоляции,
      // в будущем сможем искать услугу по названию для вычисления точного времени
      const appDuration = 60;
      const appEnd = appStart + appDuration;

      if (slotStart < appEnd && slotEnd > appStart) {
        isInterrupted = true;
        break;
      }
    }

    // Если все проверки пройдены — добавляем красивое время в массив
    if (!isInterrupted) {
      availableSlots.push(minutesToTime(slotStart));
    }
  }

  return availableSlots;
}
