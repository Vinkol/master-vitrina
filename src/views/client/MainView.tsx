import { useMainView } from './useMainView';
import { Loader } from '../../components/common/Loader';
import { MasterProfileCard } from '../../components/client/MasterProfileCard';
import { ServiceClientCard } from '../../components/client/ServiceClientCard';
import { ServiceDetailSheet } from '../../components/client/ServiceDetailSheet';

export function MainView() {
  const view = useMainView();

  if (!view.masterProfile) {
    return <Loader text="Загрузка витрины мастера..." />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 min-h-screen bg-slate-50 text-slate-800 pb-24 select-none animate-fadeIn">
      {/* КАРТОЧКА ПРОФИЛЯ */}
      <MasterProfileCard profile={view.masterProfile} workingHoursLabel={view.workingHoursLabel} />

      {/* СПИСОК ДОСТУПНЫХ УСЛУГ */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
          Доступные услуги ({view.services.length})
        </h3>

        <div className="space-y-2.5">
          {view.services.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
              <span className="text-2xl mb-2">🍃</span>
              <p className="text-xs font-bold text-slate-400">Услуг пока нет</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Мастер еще не заполнил прайс-лист</p>
            </div>
          ) : (
            view.services.map((service, index) => (
              <ServiceClientCard
                key={service.id || `service-${index}`}
                service={service}
                onClick={() => view.handleOpenDetail(service)}
              />
            ))
          )}
        </div>
      </div>

      {/* ШТОРКА ОПИСАНИЯ УСЛУГИ */}
      <ServiceDetailSheet
        service={view.activeBottomSheet}
        onClose={() => view.setActiveBottomSheet(null)}
        onSelect={view.handleSelectService}
      />
    </div>
  );
}
