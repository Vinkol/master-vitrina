import { useState, useMemo } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { Loader } from '../../components/common/Loader';
import type { Service } from '../../types';
import { haptic } from '../../utils/haptic';

export function MainView() {
  const services = useBookingStore((state) => state.services);
  const masterProfile = useBookingStore((state) => state.masterProfile);
  const selectService = useBookingStore((state) => state.selectService);

  const [activeBottomSheet, setActiveBottomSheet] = useState<Service | null>(null);
  const workingHoursLabel = useMemo<string>(() => {
    if (!masterProfile?.schedule || masterProfile.schedule.length === 0) return '10:00 — 20:00';
    const firstWorkingDay = masterProfile?.schedule.find((d) => d.is_working);
    if (!firstWorkingDay) return 'По записи';
    return `${firstWorkingDay.working_start} — ${firstWorkingDay.working_end}`;
  }, [masterProfile?.schedule]);

  if (!masterProfile) {
    return <Loader text="Загрузка витрины мастера..." />;
  }

  const handleOpenDetail = (service: Service) => {
    haptic.impact('light');
    setActiveBottomSheet(service);
  };

  const handleSelectService = (service: Service) => {
    haptic.impact('medium');
    selectService(service);
    setActiveBottomSheet(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24 select-none animate-fadeIn">
      {/* Карточка профиля мастера */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 to-purple-500" />
        {/* Аватар профиля */}
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-inner border-2 border-white mt-2 overflow-hidden bg-slate-100">
          {masterProfile.avatar?.startsWith('data:image') ? (
            <img
              src={masterProfile.avatar}
              alt={masterProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{masterProfile.avatar || '💅'}</span>
          )}
        </div>

        {/* Имя и БИО из СУБД */}
        <h2 className="text-xl font-black mt-3 text-slate-800">
          {masterProfile.name || 'Бьюти-Мастер'}
        </h2>

        {masterProfile.bio && (
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
            {masterProfile.bio}
          </p>
        )}

        {/* Блок рабочего времени на основе реального schedule */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center items-center space-x-2 text-[11px] text-slate-400 font-bold uppercase tracking-wide">
          <span>🕒 Время работы:</span>
          <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md normal-case font-extrabold">
            {workingHoursLabel}
          </span>
        </div>
      </div>

      {/* Список услуг */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
          Доступные услуги ({services.length})
        </h3>

        <div className="space-y-2.5">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
              <span className="text-2xl mb-2">🍃</span>
              <p className="text-xs font-bold text-slate-400">Услуг пока нет</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Мастер еще не заполнил прайс-лист</p>
            </div>
          ) : (
            services.map((service, index) => (
              <div
                key={service.id || `service-${index}`}
                onClick={() => handleOpenDetail(service)}
                className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-center group shadow-xs active:scale-[0.99]"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                    ⏱ {service.duration} мин
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 text-base">{service.price} ₽</p>
                  <p className="text-[10px] text-slate-300 underline decoration-dotted font-medium">
                    подробнее
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM SHEET (Шторка описания услуги) */}
      {activeBottomSheet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />

          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 leading-tight">
                  {activeBottomSheet.title}
                </h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">
                  ⏱ Длительность: {activeBottomSheet.duration} минут
                </p>
              </div>
              <p className="text-lg font-black text-indigo-600 shrink-0 ml-4">
                {activeBottomSheet.price} ₽
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium">
              {activeBottomSheet.description || 'Описание услуги не указано мастером.'}
            </p>

            <button
              onClick={() => handleSelectService(activeBottomSheet)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm"
            >
              Выбрать эту услугу →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
