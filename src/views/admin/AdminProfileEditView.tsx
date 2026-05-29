import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { Loader } from '../../components/common/Loader';
import { haptic } from '../../utils/haptic';

export function AdminProfileEditView() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const updateProfileInDB = useBookingStore((state) => state.updateProfileInDB);
  const setScreen = useBookingStore((state) => state.setScreen);
  const [name, setName] = useState<string>(() => masterProfile?.name || '');
  const [bio, setBio] = useState<string>(() => masterProfile?.bio || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!masterProfile) {
    return <Loader text="Загрузка профиля..." />;
  }

  // Хендлер сохранения данных одной кнопкой
  const handleSave = async () => {
    haptic.impact('medium');
    setIsSaving(true);
    try {
      await updateProfileInDB({ name, bio });
      setScreen('admin-dashboard');
    } catch (e) {
      console.error('Ошибка сохранения профиля:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик загрузки фото (Base64)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      haptic.impact('light');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateProfileInDB({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none">
      {/* ХЕДЕР */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-xs sticky top-0 z-10">
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
            <h2 className="text-sm font-black text-slate-800 leading-tight">Данные витрины</h2>
            <p className="text-[10px] text-slate-400 font-medium">Настройка внешнего вида</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md active:scale-98 ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Основной контейнер формы */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        {/* Загрузка фото */}
        <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-50">
          <label className="w-full text-xs font-bold text-slate-400 uppercase tracking-wider">
            Фото профиля
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
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <p className="text-[9px] text-slate-400 font-medium text-center leading-tight">
            Нажми на фото, чтобы загрузить из галереи или снять на камеру
          </p>
        </div>

        {/* Текстовые поля */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Имя мастера / Студии:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700 transition-colors"
              placeholder="Введите ваше имя"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Короткое БИО (описание):
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 leading-relaxed text-slate-700 transition-colors"
              placeholder="Расскажите о себе, вашем опыте или услугах"
            />
          </div>
        </div>
      </div>

      {/* Информационная подсказка */}
      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[11px] text-indigo-900/80 font-semibold leading-relaxed">
          ✨ Данные сохраняются только после нажатия кнопки «Сохранить». Ваши клиенты сразу увидят
          обновленный профиль на витрине онлайн-записи.
        </p>
      </div>
    </div>
  );
}
