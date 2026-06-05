import { useMemo } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { MenuRowButton } from '../../components/admin/MenuRowButton';
import { Loader } from '../../shared/ui/loader/Loader';
import { haptic } from '../../shared/lib/haptic/haptic';

export function AdminDashboardView() {
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const appointments = useBookingStore((state) => state.appointments);
  const setScreen = useBookingStore((state) => state.setScreen);
  const workingDaysCount = useMemo(() => {
    return masterProfile?.schedule?.filter((d) => d.is_working).length || 0;
  }, [masterProfile?.schedule]);

  if (!masterProfile) {
    return <Loader text="Загрузка панели..." />;
  }

  const handleNavigate = (screenName: Parameters<typeof setScreen>[0]) => {
    haptic.impact('light');
    setScreen(screenName);
  };

  const activeAppointmentsCount = appointments?.length || 0;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none animate-fadeIn">
      {/* КАРТОЧКА БЫСТРОЙ СТАТИСТИКИ */}
      <DashboardStats appointmentsCount={activeAppointmentsCount} />

      {/* СПИСОК НАСТРОЕК ВИТРИНЫ */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">
          Настройки витрины
        </p>

        {/* Данные Профиля */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-profile-edit')}
          title="Данные профиля"
          subtitle={`${masterProfile.name || 'Имя не указано'} • ${masterProfile.bio || 'Без БИО'}`}
          icon={
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
              {masterProfile.avatar?.startsWith('data:image') ? (
                <img
                  src={masterProfile.avatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
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
          }
        />

        {/* Ссылка для клиентов */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-link-share')}
          title="Ссылка для записи"
          subtitle="Поделиться витриной в соцсетях"
          icon={
            <span className="text-xl bg-emerald-50 p-2.5 rounded-xl group-hover:bg-emerald-100 transition-colors">
              🔗
            </span>
          }
        />

        {/* Прайс-лист услуг */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-services')}
          title="Настройка услуг"
          subtitle="Добавление, удаление и цены"
          icon={
            <span className="text-xl bg-amber-50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-colors">
              📋
            </span>
          }
        />

        {/* Расписание рабочего времени */}
        <MenuRowButton
          onClick={() => handleNavigate('admin-hours-edit')}
          title="Рабочее время"
          subtitle={`Рабочих дней на этой неделе: ${workingDaysCount} из 7`}
          icon={
            <span className="text-xl bg-sky-50 p-2.5 rounded-xl group-hover:bg-sky-100 transition-colors">
              ⏰
            </span>
          }
        />
      </div>
    </div>
  );
}
