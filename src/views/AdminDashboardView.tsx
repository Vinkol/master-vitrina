import { useBookingStore } from '../store/bookingStore';

export function AdminDashboardView() {
  const { masterProfile, updateProfileInDB, appointments } = useBookingStore();

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-slate-50 min-h-screen text-slate-800 pb-24">
      {/* Шапка админки */}
      <div className="bg-indigo-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="text-3xl bg-white/10 p-3 rounded-2xl backdrop-blur-md">⚙️</div>
          <div>
            <h2 className="text-lg font-bold">Панель Мастера</h2>
            <p className="text-xs text-indigo-200">Настройка витрины и расписания</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-800/40 rounded-full blur-xl" />
      </div>

      {/* Кнопка перехода в прайс-лист */}
      <button
        onClick={() => useBookingStore.getState().setScreen('admin-services')}
        className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all group hover:border-indigo-100"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">📋</span>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              Настройка услуг
            </p>
            <p className="text-xs text-slate-400">Добавление, удаление и цены</p>
          </div>
        </div>
        <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">→</span>
      </button>

      {/* Редактирование Профиля */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          1. Данные витрины
        </h3>

        {/* Загрузка реального фото из галереи / камеры */}
        <div className="flex flex-col items-center space-y-2 pb-2 border-b border-slate-50">
          <label className="w-full text-xs font-semibold text-slate-500 text-left">
            Фото профиля:
          </label>

          <div className="relative group">
            {/* Круглый контейнер аватарки в админке */}
            <div className="w-24 h-24 bg-slate-100 border-4 border-white shadow-md rounded-full flex items-center justify-center overflow-hidden">
              {masterProfile.avatar?.startsWith('data:image') ? (
                <img
                  src={masterProfile.avatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <span className="text-3xl">{masterProfile.avatar || '💅'}</span>
              )}
            </div>

            {/* Нативная кнопка-инпут поверх аватарки */}
            <label className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold space-y-0.5">
              <span>📷</span>
              <span>Изменить</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      // Сохраняем готовую Base64 строку в наш стор
                      if (typeof reader.result === 'string') {
                        updateProfileInDB({ avatar: reader.result });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Нажми на фото, чтобы загрузить из галереи или снять на камеру
          </p>
        </div>

        {/* Инпуты имени и БИО */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Имя мастера / Студии:
            </label>
            <input
              type="text"
              value={masterProfile.name}
              onChange={(e) => updateProfileInDB({ name: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Короткое БИО (описание):
            </label>
            <textarea
              value={masterProfile.bio}
              onChange={(e) => updateProfileInDB({ bio: e.target.value })}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Настройка рабочего времени */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          2. Рабочие часы
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Начало работы:
            </label>
            <input
              type="time"
              value={masterProfile.working_start}
              onChange={(e) => updateProfileInDB({ working_start: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 text-center font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Конец работы:</label>
            <input
              type="time"
              value={masterProfile.working_end}
              onChange={(e) => updateProfileInDB({ working_end: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 text-center font-bold"
            />
          </div>
        </div>
      </div>

      {/* ЖУРНАЛ ЗАПИСЕЙ КЛИЕНТОВ ИЗ SUPABASE */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
          Ближайшие записи ({appointments.length})
        </h3>

        {appointments.length > 0 ? (
          <div className="space-y-2.5">
            {appointments.map((app, index) => (
              <div
                key={app.id || `app-${index}`}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-1.5 animate-fadeIn"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{app.client_name}</span>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{app.service_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {app.date} в {app.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center text-xs text-slate-400 font-medium">
            Записей пока нет. Они появятся, когда клиенты забронируют время на витрине.
          </div>
        )}
      </div>
    </div>
  );
}
