import { useState } from 'react';
import { useAdminHours } from './useAdminHours';
import { WorkDayConfigCard } from '../../components/admin/WorkDayConfigCard';
import { Loader } from '../../shared/ui/loader/Loader';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { SlidersHorizontal, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

// Конфиги опций для кнопок
const STEP_OPTIONS = [15, 30, 45, 60];

const MASTER_BUFFER_OPTIONS = [
  { label: '0 мин (Сразу)', value: 0 },
  { label: '30 мин', value: 30 },
  { label: '1 час', value: 60 },
  { label: '2 часа', value: 120 },
];

const CLIENT_BUFFER_OPTIONS = [
  { label: '1 час', value: 60 },
  { label: '3 часа', value: 180 },
  { label: '6 часов', value: 360 },
  { label: '12 часов', value: 720 },
  { label: '1 сутки', value: 1440 },
];

export function AdminHoursEditView() {
  const hours = useAdminHours();

  // Локальный переключатель вкладок: 'schedule' или 'slots'
  const [activeTab, setActiveTab] = useState<'schedule' | 'slots'>('schedule');

  if (!hours.masterProfile) {
    return <Loader text="Загрузка настроек графика..." />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* ХЕДЕР С КНОПКОЙ СОХРАНЕНИЯ */}
      <PageHeader
        title="Настройка записи"
        subtitle={activeTab === 'schedule' ? 'График работы' : 'Интервалы и лимиты'}
        onBackClick={() => hours.setScreen('admin-dashboard')}
        onSaveClick={() => {
          void hours.handleSave();
        }}
        isSaving={hours.isSaving}
      />

      {/* КНОПКИ ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl border border-slate-200/20">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-lg transition-all active:scale-98 ${
            activeTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>График работы</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-lg transition-all active:scale-98 ${
            activeTab === 'slots'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Настройка слотов</span>
        </button>
      </div>

      {/* ВКЛАДКА 1: НАСТРОЙКА ЧАСОВ РАБОТЫ ПО ДНЯМ */}
      {activeTab === 'schedule' && (
        <div className="space-y-3 animate-fadeIn">
          {hours.schedule.map((day) => (
            <WorkDayConfigCard
              key={day.day_index}
              day={day}
              dayName={DAYS_OF_WEEK[day.day_index]}
              onUpdateDay={(fields) => hours.updateDay(day.day_index, fields)}
              onAddBreak={() => hours.addBreak(day.day_index)}
              onRemoveBreak={(breakId) => hours.removeBreak(day.day_index, breakId)}
              onUpdateBreak={(breakId, fields) => hours.updateBreak(day.day_index, breakId, fields)}
            />
          ))}
        </div>
      )}

      {/* ВКЛАДКА 2: НАСТРОЙКА ИНТЕРВАЛОВ СЛОТОВ И БУФЕРОВ */}
      {activeTab === 'slots' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Блок 1: Шаг записи */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-xs text-left">
            <div>
              <h4 className="text-sm font-black text-slate-800">Интервал между окнами</h4>
              <p className="text-[11px] text-slate-400">
                Интервал времени между доступными окошками на витрине
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STEP_OPTIONS.map((minutes) => {
                const isSelected = hours.slotStep === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => hours.setSlotStep(minutes)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {minutes} мин
                  </button>
                );
              })}
            </div>
          </div>

          {/* Блок 2: Буфер для клиентов */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-xs text-left">
            <div>
              <h4 className="text-sm font-black text-slate-800">Буфер времени для клиентов</h4>
              <p className="text-[11px] text-slate-400">
                За сколько часов до начала визита клиент может записаться сам
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CLIENT_BUFFER_OPTIONS.map((opt) => {
                const isSelected = hours.clientBuffer === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => hours.setClientBuffer(opt.value)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all text-center active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Блок 3: Буфер для мастера */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-xs text-left">
            <div>
              <h4 className="text-sm font-black text-slate-800">Буфер времени для вас</h4>
              <p className="text-[11px] text-slate-400">
                За какое время вы можете вручную добавить запись на текущий день
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MASTER_BUFFER_OPTIONS.map((opt) => {
                const isSelected = hours.masterBuffer === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => hours.setMasterBuffer(opt.value)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all text-center active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* НИЖНИЙ ИНФО-БЛОК */}
      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[10px] font-medium text-slate-400 text-center px-4 leading-normal">
          Данные сохраняются только после нажатия кнопки «Сохранить». На основе этих настроек
          система автоматически генерирует доступные тайм-слоты на экранах записи.
        </p>
      </div>
    </div>
  );
}
