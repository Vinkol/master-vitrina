import type { DaySchedule, Appointment, Service } from '../../types';

interface GeneratorOptions {
  selectedDate: string;
  daySchedule: DaySchedule;
  selectedService: Service;
  appointments: Appointment[];
  slotStepMinutes?: number;
  clientBufferMinutes?: number;
  masterBufferMinutes?: number;
  isMaster?: boolean;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
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
  clientBufferMinutes = 360,
  masterBufferMinutes = 0,
  isMaster = false,
}: GeneratorOptions): string[] {
  if (!daySchedule.is_working) return [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const targetDate = selectedDate.split('T')[0];

  if (targetDate < todayStr) return [];

  const startTimeStr = daySchedule.start_time || daySchedule.working_start;
  const endTimeStr = daySchedule.end_time || daySchedule.working_end;

  if (!startTimeStr || !endTimeStr) return [];

  const workStart = timeToMinutes(startTimeStr);
  const workEnd = timeToMinutes(endTimeStr);
  const serviceDuration = selectedService.duration;

  let timeBarrierMinutes = 0;
  if (targetDate === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const bufferMinutes = isMaster ? masterBufferMinutes : clientBufferMinutes;
    timeBarrierMinutes = currentMinutes + bufferMinutes;
  }

  const dayAppointments = appointments.filter((app) => app.date.split('T')[0] === targetDate);

  const availableSlots: string[] = [];

  for (let current = workStart; current + serviceDuration <= workEnd; current += slotStepMinutes) {
    const slotStart = current;
    const slotEnd = current + serviceDuration;

    if (targetDate === todayStr && slotStart < timeBarrierMinutes) {
      continue;
    }

    let isInterrupted = false;

    let breaksList = daySchedule.breaks || [];
    if (breaksList.length === 0 && daySchedule.break_start && daySchedule.break_end) {
      breaksList = [
        { id: 'temp-break', start: daySchedule.break_start, end: daySchedule.break_end },
      ];
    }

    for (const brk of breaksList) {
      if (!brk.start || !brk.end) continue;
      const breakStart = timeToMinutes(brk.start);
      const breakEnd = timeToMinutes(brk.end);

      if (slotStart < breakEnd && slotEnd > breakStart) {
        isInterrupted = true;
        break;
      }
    }

    if (isInterrupted) continue;

    for (const app of dayAppointments) {
      const appStart = timeToMinutes(app.time);
      const appDuration = app.service_duration || 60;
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
