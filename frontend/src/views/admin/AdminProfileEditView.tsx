import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { Loader } from '../../shared/ui/loader/Loader';
import { haptic } from '../../shared/lib/haptic/haptic';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';

export function AdminProfileEditView() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const updateProfileInDB = useBookingStore((state) => state.updateProfileInDB);
  const setScreen = useBookingStore((state) => state.setScreen);

  const [name, setName] = useState<string>(() => masterProfile?.name || '');
  const [bio, setBio] = useState<string>(() => masterProfile?.bio || '');
  const [avatar, setAvatar] = useState<string | null>(() => masterProfile?.avatar || null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!masterProfile) {
    return <Loader text="Загрузка профиля..." />;
  }

  const handleSave = async () => {
    haptic.impact('medium');
    setIsSaving(true);
    try {
      await updateProfileInDB({ name, bio, avatar: avatar || undefined });
      setScreen('admin-dashboard');
    } catch (e) {
      console.error('Ошибка сохранения профиля:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      haptic.impact('light');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none">
      <PageHeader
        title="Данные витрины"
        subtitle="Настройка внешнего вида"
        onBackClick={() => setScreen('admin-dashboard')}
        onSaveClick={handleSave}
        isSaving={isSaving}
      />

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-50">
          <label className="w-full text-xs font-bold text-slate-400 uppercase tracking-wider">
            Фото профиля
          </label>

          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 border-4 border-white shadow-md rounded-full flex items-center justify-center overflow-hidden">
              {/* ИСПРАВЛЕНО: Рендерим картинку из локального стейта аватарки для мгновенного превью */}
              {avatar?.startsWith('data:image') ? (
                <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="text-3xl">{avatar || '💅'}</span>
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

      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[11px] text-indigo-900/80 font-semibold leading-relaxed">
          ✨ Данные сохраняются только после нажатия кнопки «Сохранить». Ваши клиенты сразу увидят
          обновленный профиль на витрине онлайн-записи.
        </p>
      </div>
    </div>
  );
}
