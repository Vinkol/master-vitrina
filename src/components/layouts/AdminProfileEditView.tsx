import { useBookingStore } from '../../store/bookingStore';

export function AdminProfileEditView() {
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
          <h2 className="text-base font-black text-slate-800">Данные витрины</h2>
          <p className="text-[10px] text-slate-400 font-medium">Настройка внешнего вида</p>
        </div>
      </div>

      {/* Основной контейнер формы */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        {/* Загрузка фото */}
        <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-50">
          <label className="w-full text-xs font-semibold text-slate-500 text-left">
            Фото профиля:
          </label>

          <div className="relative group">
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

        {/* Текстовые поля */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Имя мастера / Студии:
            </label>
            <input
              type="text"
              value={masterProfile.name || ''}
              onChange={(e) => updateProfileInDB({ name: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium"
              placeholder="Введите ваше имя"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Короткое БИО (описание):
            </label>
            <textarea
              value={masterProfile.bio || ''}
              onChange={(e) => updateProfileInDB({ bio: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 leading-relaxed"
              placeholder="Расскажите о себе, вашем опыте или графике"
            />
          </div>
        </div>
      </div>

      {/* Информационная подсказка */}
      <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200/30 text-left">
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          ✨ Изменения сохраняются автоматически при вводе. Ваши клиенты сразу увидят обновленные
          данные на витрине.
        </p>
      </div>
    </div>
  );
}
