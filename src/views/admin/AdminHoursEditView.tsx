import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { Loader } from '../../components/common/Loader';
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
  is_working: i < 5, // Пн-Пт рабочие по дефолту
  working_start: '10:00',
  working_end: '20:00',
  breaks: [],
}));

export function AdminHoursEditView() {
  const { masterProfile, updateProfileInDB, setScreen } = useBookingStore();
  // Локальный стейт для быстрой работы интерфейса
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

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const updateDay = (dayIndex: number, fields: Partial<DaySchedule>) => {
    const updated = schedule.map((d) => (d.day_index === dayIndex ? { ...d, ...fields } : d));
    setSchedule(updated);
  };

  const addBreak = (dayIndex: number) => {
    triggerHaptic();
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
    triggerHaptic();
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
    triggerHaptic();
    await updateProfileInDB({ schedule });
    setScreen('admin-dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none">
      {/* Хедер с кнопкой Сохранить */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 sticky top-2 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScreen('admin-dashboard')}
            className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs text-slate-400 font-bold active:scale-95 transition-all text-xs"
          >
            ← Назад
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">График работы</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Настройка слотов
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md active:scale-98"
        >
          Сохранить
        </button>
      </div>

      {/* Список дней недели — ЭТОТ БЛОК ОТРИСОВЫВАЕТ ВСЕ ДНИ */}
      <div className="space-y-3">
        {schedule.map((day) => {
          const dayName = DAYS_OF_WEEK[day.day_index];

          return (
            <div
              key={day.day_index}
              className={`p-4 rounded-3xl border transition-all ${
                day.is_working
                  ? 'bg-white border-slate-100 shadow-xs'
                  : 'bg-slate-100/50 border-dashed border-slate-200 opacity-70'
              }`}
            >
              {/* Шапка конкретного дня */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`day-${day.day_index}`}
                    checked={day.is_working}
                    onChange={(e) => {
                      triggerHaptic();
                      updateDay(day.day_index, { is_working: e.target.checked });
                    }}
                    className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${day.day_index}`}
                    className="text-xs font-black text-slate-700 cursor-pointer"
                  >
                    {dayName}
                  </label>
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    day.is_working
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-400 bg-slate-200/50'
                  }`}
                >
                  {day.is_working ? 'Работаю' : 'Выходной'}
                </span>
              </div>

              {/* Настройки часов (показываем, только если день рабочий) */}
              {day.is_working && (
                <div className="space-y-3 pt-1 border-t border-slate-50">
                  {/* Основной рабочий интервал */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-[10px] font-bold text-slate-400">С</span>
                      <input
                        type="time"
                        value={day.working_start}
                        onChange={(e) =>
                          updateDay(day.day_index, { working_start: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold bg-slate-50 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-[10px] font-bold text-slate-400">ДО</span>
                      <input
                        type="time"
                        value={day.working_end}
                        onChange={(e) => updateDay(day.day_index, { working_end: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold bg-slate-50 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => addBreak(day.day_index)}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-2 rounded-xl transition-colors shrink-0"
                    >
                      + Перерыв
                    </button>
                  </div>

                  {/* Список динамических перерывов внутри этого дня */}
                  {day.breaks && day.breaks.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-indigo-100 mt-2">
                      {day.breaks.map((brk) => (
                        <div
                          key={brk.id}
                          className="flex items-center justify-between gap-2 bg-slate-50/60 p-1.5 rounded-xl border border-slate-100"
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                            Перерыв:
                          </span>
                          <input
                            type="time"
                            value={brk.start}
                            onChange={(e) =>
                              updateBreak(day.day_index, brk.id, { start: e.target.value })
                            }
                            className="w-20 p-1 rounded-md border border-slate-200 text-[11px] text-center font-bold bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-slate-300">—</span>
                          <input
                            type="time"
                            value={brk.end}
                            onChange={(e) =>
                              updateBreak(day.day_index, brk.id, { end: e.target.value })
                            }
                            className="w-20 p-1 rounded-md border border-slate-200 text-[11px] text-center font-bold bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            onClick={() => removeBreak(day.day_index, brk.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Информационный блок */}
      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/40 text-left">
        <p className="text-[11px] text-indigo-900 font-semibold leading-relaxed">
          ⏰ На основе этих часов система автоматически генерирует доступные тайм-слоты для ваших
          клиентов на экране онлайн-записи.
        </p>
      </div>
    </div>
  );
}
