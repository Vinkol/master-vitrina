import { useBookingStore } from '../store/bookingStore';

export function AdminHoursEditView() {
  const { masterProfile, updateProfileInDB } = useBookingStore();

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 bg-slate-50 min-h-screen text-slate-800 pb-24">
      {/* Кнопка назад и заголовок */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => useBookingStore.getState().setScreen('admin-dashboard')}
          className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 active:scale-95 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h2 className="text-base font-black text-slate-800">Рабочее время</h2>
          <p className="text-[10px] text-slate-400 font-medium">Настройка графика работы</p>
        </div>
      </div>

      {/* Основной контейнер настройки часов */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Интервал работы
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Ежедневно
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Начало работы:
            </label>
            <input
              type="time"
              value={masterProfile.working_start || '10:00'}
              onChange={(e) => updateProfileInDB({ working_start: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 text-center font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Конец работы:</label>
            <input
              type="time"
              value={masterProfile.working_end || '20:00'}
              onChange={(e) => updateProfileInDB({ working_end: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 text-center font-bold"
            />
          </div>
        </div>
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
