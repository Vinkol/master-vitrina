import { haptic } from '../../shared/lib/haptic/haptic';

interface CalendarDayButtonProps {
  dayNumber: number;
  currentDayIso: string;
  isSelected: boolean;
  isToday: boolean;
  hasAppointments: boolean;
  onSelectDay: (isoDate: string) => void;
}

export function CalendarDayButton({
  dayNumber,
  currentDayIso,
  isSelected,
  isToday,
  hasAppointments,
  onSelectDay,
}: CalendarDayButtonProps) {
  const handleClick = () => {
    haptic.impact('light');
    onSelectDay(currentDayIso);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`h-10 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs transition-all active:scale-90 ${
        isSelected
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-black'
          : isToday
            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
            : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200 shadow-xs'
      }`}
    >
      <span>{dayNumber}</span>
      {hasAppointments && (
        <span
          className={`absolute bottom-1 w-1 h-1 rounded-full ${
            isSelected ? 'bg-white' : 'bg-indigo-500'
          }`}
        />
      )}
    </button>
  );
}
