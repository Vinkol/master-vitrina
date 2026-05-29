import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { Loader } from '../../components/common/Loader';
import { WorkDayConfigCard } from '../../components/admin/WorkDayConfigCard';
import { haptic } from '../../utils/haptic';
import type { DaySchedule, TimeInterval } from '../../types';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

const defaultSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  day_index: i,
  is_working: i < 5,
  working_start: '10:00',
  working_end: '20:00',
  breaks: [],
}));

export function AdminHoursEditView() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const updateProfileInDB = useBookingStore((state) => state.updateProfileInDB);
  const setScreen = useBookingStore((state) => state.setScreen);

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const fromDB = masterProfile?.schedule as DaySchedule[] | undefined;
    if (!fromDB || fromDB.length === 0) {
      return defaultSchedule;
    }
    return fromDB;
  });

  if (!masterProfile) {
    return <Loader text="Загрузка настроек графика..." />;
  }

  const updateDay = (dayIndex: number, fields: Partial<DaySchedule>) => {
    const updated = schedule.map((d) => (d.day_index === dayIndex ? { ...d, ...fields } : d));
    setSchedule(updated);
  };

  const addBreak = (dayIndex: number) => {
    haptic.impact('light');
    const newBreak: TimeInterval = {
      id: crypto.randomUUID(),
      start: '13:00',
      end: '14:00',
    };
    const updated = schedule.map((d) =>
      d.day_index === dayIndex ? { ...d, breaks: [...d.breaks, newBreak] } : d,
    );
    setSchedule(updated);
  };

  const removeBreak = (dayIndex: number, breakId: string) => {
    haptic.impact('light');
    const updated = schedule.map((d) =>
      d.day_index === dayIndex ? { ...d, breaks: d.breaks.filter((b) => b.id !== breakId) } : d,
    );
    setSchedule(updated);
  };

  const updateBreak = (dayIndex: number, breakId: string, fields: Partial<TimeInterval>) => {
    const updated = schedule.map((d) => {
      if (d.day_index !== dayIndex) return d;
      return {
        ...d,
        breaks: d.breaks.map((b) => (b.id === breakId ? { ...b, ...fields } : b)),
      };
    });
    setSchedule(updated);
  };

  const handleSave = async () => {
    haptic.impact('medium');
    await updateProfileInDB({ schedule });
    setScreen('admin-dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* Хедер с кнопкой Сохранить */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 sticky top-2 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              haptic.impact('light');
              setScreen('admin-dashboard');
            }}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-slate-400 font-bold active:scale-95 transition-all text-xs"
          >
            ← Назад
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">График работы</h2>
            <p className="text-[10px] text-slate-400 font-medium">Настройка времени</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md active:scale-98"
        >
          Сохранить
        </button>
      </div>

      {/* Список дней недели */}
      <div className="space-y-3">
        {schedule.map((day) => (
          <WorkDayConfigCard
            key={day.day_index}
            day={day}
            dayName={DAYS_OF_WEEK[day.day_index]}
            onUpdateDay={(fields) => updateDay(day.day_index, fields)}
            onAddBreak={() => addBreak(day.day_index)}
            onRemoveBreak={(breakId) => removeBreak(day.day_index, breakId)}
            onUpdateBreak={(breakId, fields) => updateBreak(day.day_index, breakId, fields)}
          />
        ))}
      </div>

      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[11px] text-indigo-900/80 font-semibold leading-relaxed">
          ⏰ На основе этих часов система автоматически генерирует доступные тайм-слоты для ваших
          клиентов на экране онлайн-записи.
        </p>
      </div>
    </div>
  );
}
