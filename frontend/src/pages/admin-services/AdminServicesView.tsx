import { useState } from 'react';
import type { FormEvent } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useServices } from '../../features/master/useServices';
import { ServiceFormSheet } from '../../features/service-management/ServiceFormSheet';
import type { Service } from '../../types';
import type { BookingState } from '../../store/types';
import { haptic } from '../../shared/lib/haptic/haptic';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { ServiceCard } from '../../entities/service/ServiceCard';
import { Loader } from '../../shared/ui/loader/Loader';
import { Briefcase, Plus } from 'lucide-react';

export function AdminServicesView() {
  const setScreen = useBookingStore((state: BookingState) => state.setScreen);
  const {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    isAdding,
    isUpdating,
    isDeleting,
  } = useServices();

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [description, setDescription] = useState<string>('');
  const isMutating = isAdding || isUpdating || isDeleting;

  const handleOpenCreate = () => {
    haptic.impact('light');
    setEditingService(null);
    setTitle('');
    setPrice('');
    setDuration('60');
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setDescription(service.description || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !price || !duration || isMutating) return;

    haptic.impact('medium');

    const serviceData = {
      title: title.trim(),
      price: Number(price),
      duration: Number(duration),
      description: description.trim(),
    };

    void (async () => {
      try {
        if (editingService) {
          await updateService({ id: editingService.id, fields: serviceData });
        } else {
          await addService(serviceData);
        }
        setIsFormOpen(false);
      } catch (err) {
        console.error('Не удалось сохранить услугу на бэкенде', err);
      }
    })();
  };

  const handleDeleteService = (id: string) => {
    haptic.impact('medium');
    if (isMutating) return;

    void (async () => {
      try {
        await deleteService(id);
      } catch (err) {
        console.error('Не удалось удалить услугу через FastAPI', err);
      }
    })();
  };

  if (isLoading && services.length === 0) {
    return <Loader text="Загрузка прайс-листа..." />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-slate-50 min-h-screen text-slate-800 pb-36 select-none animate-fadeIn">
      <PageHeader
        title="Управление прайсом"
        subtitle="Нажми на услугу для редактирования"
        onBackClick={() => setScreen('admin-dashboard')}
      />

      {/* Список услуг */}
      <div className="space-y-2.5">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center animate-fadeIn">
            <div className="p-3 bg-slate-50 text-slate-300 rounded-full mb-2 shrink-0">
              <Briefcase className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold text-slate-400">Прайс-лист пуст</p>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Добавьте первую услугу, чтобы запустить запись
            </p>
          </div>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteService}
            />
          ))
        )}
      </div>

      {/* Плавающая нижняя кнопка */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
        <button
          onClick={handleOpenCreate}
          disabled={isMutating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5 group disabled:opacity-50"
        >
          <Plus
            className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200"
            strokeWidth={2.5}
          />
          <span>Добавить новую услугу</span>
        </button>
      </div>

      <ServiceFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingService={editingService}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        duration={duration}
        setDuration={setDuration}
        onSave={handleSave}
      />
    </div>
  );
}
