import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import type { Service } from '../../types';

export function MainView() {
  const { selectService, setScreen, services, masterProfile } = useBookingStore();
  const [activeBottomSheet, setActiveBottomSheet] = useState<Service | null>(null);

  const handleOpenDetail = (service: Service) => {
    setActiveBottomSheet(service);
  };

  const handleSelectService = (service: Service) => {
    selectService(service);
    setActiveBottomSheet(null);
    setScreen('calendar');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Профиль мастера */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100/80 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 to-purple-500" />

        {/* Выводим реальное фото или дефолтную заглушку */}
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

        {/* Выводим имя из стора */}
        <h2 className="text-xl font-bold mt-3 text-slate-800">{masterProfile.name}</h2>

        {/* Выводим БИО из стора */}
        <p className="text-sm text-slate-400 mt-3 max-w-xs mx-auto leading-relaxed">
          {masterProfile.bio}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center items-center space-x-2 text-xs text-slate-500 font-medium">
        <span>🕒 Время работы:</span>
        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
          {masterProfile.working_start} — {masterProfile.working_end}
        </span>
      </div>

      {/* Список услуг */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
          Доступные услуги ({services.length})
        </h3>

        <div className="space-y-2.5">
          {services.map((service, index) => (
            <div
              key={service.id || `service-${index}`}
              onClick={() => handleOpenDetail(service)}
              className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-center group shadow-sm active:scale-[0.99]"
            >
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                  {service.title}
                </p>
                <p className="text-xs text-slate-400 font-medium">⏱ {service.duration} мин</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600 text-base">{service.price} ₽</p>
                <p className="text-[10px] text-slate-400 underline decoration-dotted">подробнее</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SHEET (Шторка описания услуги) */}
      {activeBottomSheet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity flex items-end justify-center">
          {/* Задник для закрытия при клике мимо */}
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />

          {/* Контент шторки */}
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100">
            {/* Полоска-индикатор сверху */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{activeBottomSheet.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ⏱ Длительность: {activeBottomSheet.duration} минут
                </p>
              </div>
              <p className="text-xl font-black text-indigo-600">{activeBottomSheet.price} ₽</p>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {activeBottomSheet.description || 'Описание услуги не указано мастером.'}
            </p>

            <button
              onClick={() => handleSelectService(activeBottomSheet)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm"
            >
              Выбрать эту услугу →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
