import { useMemo } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useMasterProfile } from '../../features/master/useMasterProfile'; // Оставили только профиль
import { MenuRowButton } from '../../components/admin/MenuRowButton';
import { Loader } from '../../shared/ui/loader/Loader';
import { haptic } from '../../shared/lib/haptic/haptic';
import { CalendarClock, MessageSquare, Settings } from 'lucide-react';

export function AdminDashboardView() {
  const setScreen = useBookingStore((state) => state.setScreen);
  const { profile: masterProfile, isLoading: isProfileLoading } = useMasterProfile();
  const workingDaysCount = useMemo(() => {
    return masterProfile?.schedule?.filter((d) => d.is_working).length || 0;
  }, [masterProfile?.schedule]);

  if (isProfileLoading || !masterProfile) {
    return <Loader text="Загрузка панели..." />;
  }

  const handleNavigate = (screenName: Parameters<typeof setScreen>[0]) => {
    haptic.impact('light');
    setScreen(screenName);
  };

  const handleOpenSupport = () => {
    const supportUrl = 'https://t.me/DKVinkol';

    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(supportUrl);
    } else {
      window.open(supportUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none animate-fadeIn">
      {/* СПИСОК НАСТРОЕК ВИТРИНЫ */}
      <div className="space-y-3 pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">
          Настройки витрины
        </p>

        {/* Данные Профиля */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-profile-edit')}
          title="Данные профиля"
          subtitle={`${masterProfile.name || 'Имя не указано'} • ${masterProfile.bio || 'Без БИО'}`}
          icon={
            <svg
              className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition-colors"
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
          }
        />

        {/* Расписание рабочего времени */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-hours-edit')}
          title="Рабочее время"
          subtitle={`Рабочих дней на этой неделе: ${workingDaysCount} из 7`}
          icon={<CalendarClock className="w-5 h-5 text-indigo-600" />}
        />

        <MenuRowButton
          onClick={() => handleNavigate('admin-settings')}
          title="Общие настройки"
          subtitle="Валюта, настройка языка и темы"
          icon={<Settings className="w-5 h-5 text-indigo-600" />}
        />

        <MenuRowButton
          onClick={handleOpenSupport}
          title="Прямая поддержка"
          subtitle="Что-то сломалось или есть идея? Напишите мне лично"
          icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}
        />
      </div>
    </div>
  );
}
