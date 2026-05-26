import { useBookingStore } from '../../store/bookingStore';
import { Loader } from '../ui/Loader'; // Импортируем наш крутой лоадер

export function AdminDashboardView() {
  const { masterProfile, appointments } = useBookingStore();

  if (!masterProfile) {
    return <Loader text="Загрузка панели..." />;
  }

  const activeAppointmentsCount = appointments?.length || 0;
  const workingDaysCount = masterProfile.schedule?.filter((d) => d.is_working).length || 0;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none">
      {/* Шапка админки */}
      <div className="bg-indigo-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="text-3xl bg-white/10 p-3 rounded-2xl backdrop-blur-md">⚙️</div>
          <div>
            <h2 className="text-lg font-bold">Панель Мастера</h2>
            <p className="text-xs text-indigo-200">Управление вашей цифровой витриной</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-800/40 rounded-full blur-xl" />
      </div>

      {/* Быстрая статистика инфо-карточкой */}
      <div className="p-4 bg-linear-to-r from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-sm flex justify-between items-center">
        <div>
          <p className="text-xs text-indigo-100 font-medium uppercase tracking-wider">
            Всего записей в базе
          </p>
          <p className="text-2xl font-black mt-0.5">{activeAppointmentsCount}</p>
        </div>
        <span className="text-2xl bg-white/10 p-2 rounded-xl">📅</span>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">
          Настройки витрины
        </p>

        {/* Редактирование Профиля */}
        <button
          onClick={() => useBookingStore.getState().setScreen('admin-profile-edit')}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
              {masterProfile.avatar?.startsWith('data:image') ? (
                <img src={masterProfile.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-lg">{masterProfile.avatar || '💅'}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Данные профиля
              </p>
              <p className="text-xs text-slate-400 truncate max-w-50">
                {masterProfile.name || 'Имя не указано'} • {masterProfile.bio || 'Без БИО'}
              </p>
            </div>
          </div>
          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg font-bold">
            →
          </span>
        </button>

        {/* Ссылка для клиентов */}
        <button
          onClick={() => useBookingStore.getState().setScreen('admin-link-share')}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl bg-emerald-50 p-2.5 rounded-xl group-hover:bg-emerald-100 transition-colors">
              🔗
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Ссылка для записи
              </p>
              <p className="text-xs text-slate-400">Поделиться витриной в соцсетях</p>
            </div>
          </div>
          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg font-bold">
            →
          </span>
        </button>

        {/* Прайс-лист / Услуги */}
        <button
          onClick={() => useBookingStore.getState().setScreen('admin-services')}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl bg-amber-50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-colors">
              📋
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Настройка услуг
              </p>
              <p className="text-xs text-slate-400">Добавление, удаление и цены</p>
            </div>
          </div>
          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg font-bold">
            →
          </span>
        </button>

        {/* Рабочие часы */}
        <button
          onClick={() => useBookingStore.getState().setScreen('admin-hours-edit')}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100 text-left"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl bg-sky-50 p-2.5 rounded-xl group-hover:bg-sky-100 transition-colors">
              ⏰
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Рабочее время
              </p>
              <p className="text-xs text-slate-400">
                Рабочих дней на этой неделе: {workingDaysCount} из 7
              </p>
            </div>
          </div>
          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg font-bold">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
