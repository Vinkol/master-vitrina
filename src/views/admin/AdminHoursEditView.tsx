import { useAdminHours } from './useAdminHours';
import { Loader } from '../../components/common/Loader';
import { WorkDayConfigCard } from '../../components/admin/WorkDayConfigCard';
import { PageHeader } from '../../components/common/PageHeader';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

export function AdminHoursEditView() {
  const hours = useAdminHours();

  if (!hours.masterProfile) {
    return <Loader text="Загрузка настроек графика..." />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* ХЕДЕР С КНОПКОЙ СОХРАНЕНИЯ */}
      <PageHeader
        title="График работы"
        subtitle="Настройка слотов"
        onBackClick={() => hours.setScreen('admin-dashboard')}
        onSaveClick={hours.handleSave}
      />

      {/* СПИСОК ДНЕЙ НЕДЕЛИ */}
      <div className="space-y-3">
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

      {/* ФУТЕР-ИНФОБЛОК */}
      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[11px] text-indigo-900/80 font-semibold leading-relaxed">
          ⏰ На основе этих часов система автоматически генерирует доступные тайм-слоты для ваших
          клиентов на экране онлайн-записи.
        </p>
      </div>
    </div>
  );
}
