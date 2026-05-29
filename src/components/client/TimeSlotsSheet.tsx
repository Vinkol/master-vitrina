import { haptic } from '../../utils/haptic';

interface TimeSlotsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  availableSlots: string[];
  selectedTime: string;
  onSelectTime: (slot: string) => void;
}

export function TimeSlotsSheet({
  isOpen,
  onClose,
  selectedDate,
  availableSlots,
  selectedTime,
  onSelectTime,
}: TimeSlotsSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={() => {
          haptic.impact('light');
          onClose();
        }}
      />

      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        <h4 className="text-sm font-black text-slate-900 mb-4">
          Свободные окошки на {selectedDate}
        </h4>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {availableSlots.length === 0 ? (
            <p className="col-span-3 text-center text-xs font-bold text-slate-400 py-6">
              Все окошки на этот день уже заняты 🔒
            </p>
          ) : (
            availableSlots.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  onClick={() => {
                    haptic.impact('medium');
                    onSelectTime(slot);
                  }}
                  className={`py-3 px-2 text-sm font-bold rounded-xl border transition-all active:scale-95 text-center ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {slot}
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            haptic.impact('light');
            onClose();
          }}
          className="w-full bg-slate-50 text-slate-500 font-bold py-3.5 rounded-xl border border-slate-200 transition-all text-sm active:scale-99"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
