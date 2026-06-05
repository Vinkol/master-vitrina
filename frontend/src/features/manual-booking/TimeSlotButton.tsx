import { haptic } from '../../shared/lib/haptic/haptic';

interface TimeSlotButtonProps {
  hour: string;
  isSelected: boolean;
  onSelect: (hour: string) => void;
}

export function TimeSlotButton({ hour, isSelected, onSelect }: TimeSlotButtonProps) {
  const handleClick = () => {
    haptic.impact('light');
    onSelect(hour);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all active:scale-95 text-center ${
        isSelected
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
      }`}
    >
      {hour}
    </button>
  );
}
