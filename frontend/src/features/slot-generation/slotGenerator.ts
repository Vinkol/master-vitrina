import type { DaySchedule, Appointment, Service } from '../../types';

interface GeneratorOptions {
  selectedDate: string;
  daySchedule: DaySchedule;
  selectedService: Service;
  appointments: Appointment[];
  slotStepMinutes?: number;
  isMaster?: boolean;
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
  isMaster = false,
}: GeneratorOptions): string[] {
  if (!daySchedule.is_working) return [];

  // Получаем текущую дату и время
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const targetDate = selectedDate.split('T')[0];

  // ЗАЩИТА ОТ ПРОШЛЫХ ДНЕЙ
  if (targetDate < todayStr) return [];

  const availableSlots: string[] = [];
  const workStart = timeToMinutes(daySchedule.working_start);
  const workEnd = timeToMinutes(daySchedule.working_end);
  const serviceDuration = selectedService.duration;

  // барьер времени
  let timeBarrierMinutes = 0;
  if (targetDate === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    // Мастеру +2 часа , клиенту +6 часов
    const bufferMinutes = isMaster ? 120 : 360;
    timeBarrierMinutes = currentMinutes + bufferMinutes;
  }

  const dayAppointments = appointments.filter((app) => app.date.split('T')[0] === targetDate);

  for (let current = workStart; current + serviceDuration <= workEnd; current += slotStepMinutes) {
    const slotStart = current;
    const slotEnd = current + serviceDuration;

    // ЗАЩИТА ОТ ПРОШЕДШЕГО ВРЕМЕНИ И БУФЕРОВ
    if (targetDate === todayStr && slotStart < timeBarrierMinutes) {
      continue;
    }

    let isInterrupted = false;

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

    for (const app of dayAppointments) {
      const appStart = timeToMinutes(app.time);
      const appDuration = 60;
      const appEnd = appStart + appDuration;

      if (slotStart < appEnd && slotEnd > appStart) {
        isInterrupted = true;
        break;
      }
    }

    if (!isInterrupted) {
      availableSlots.push(minutesToTime(slotStart));
    }
  }

  return availableSlots;
}
