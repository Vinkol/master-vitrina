import { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { Loader } from '../../shared/ui/loader/Loader';
import { haptic } from '../../shared/lib/haptic/haptic';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { supabase } from '../../shared/api/supabase';

export function AdminProfileEditView() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const updateProfileInDB = useBookingStore((state) => state.updateProfileInDB);
  const setScreen = useBookingStore((state) => state.setScreen);

  const [name, setName] = useState<string>(() => masterProfile?.name || '');
  const [bio, setBio] = useState<string>(() => masterProfile?.bio || '');
  const [avatar, setAvatar] = useState<string | null>(() => masterProfile?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!masterProfile) {
    return <Loader text="Загрузка профиля..." />;
  }

  const handleSave = async () => {
    haptic.impact('medium');
    setIsSaving(true);
    try {
      let finalAvatarUrl = avatar;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${masterProfile.id || crypto.randomUUID()}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const bucket = supabase.storage.from('masters');
        const response = await bucket.upload(filePath, avatarFile, { upsert: true });
        if (response.error) {
          throw response.error;
        }
        const { data: urlData } = bucket.getPublicUrl(filePath);
        finalAvatarUrl = urlData.publicUrl;
      }
      await updateProfileInDB({ name, bio, avatar: finalAvatarUrl || undefined });
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
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none">
      <PageHeader
        title="Данные профиля"
        subtitle="Настройка внешнего вида"
        onBackClick={() => setScreen('admin-dashboard')}
        onSaveClick={() => {
          void handleSave();
        }}
        isSaving={isSaving}
      />

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-50">
          <label className="w-full text-xs font-bold text-slate-400 uppercase tracking-wider">
            Фото профиля
          </label>

          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 border-4 border-white shadow-md rounded-full flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <label className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold space-y-0.5">
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
