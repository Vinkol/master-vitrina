import { useState } from 'react';
import type { FormEvent } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { ServiceFormSheet } from '../../features/service-management/ServiceFormSheet';
import type { Service } from '../../types';
import type { BookingState } from '../../store/types';
import { haptic } from '../../shared/lib/haptic/haptic';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { ServiceCard } from '../../entities/service/ServiceCard';

export function AdminServicesView() {
  // ИСПРАВЛЕНО: Явно типизируем вызовы методов стора
  const services = useBookingStore((state: BookingState) => state.services);
  const addService = useBookingStore((state: BookingState) => state.addService);
  const updateService = useBookingStore((state: BookingState) => state.updateService);
  const deleteService = useBookingStore((state: BookingState) => state.deleteService);
  const setScreen = useBookingStore((state: BookingState) => state.setScreen);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [description, setDescription] = useState<string>('');

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
    if (!title || !price || !duration) return;

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
          await updateService(editingService.id, serviceData);
        } else {
          await addService(serviceData);
        }
        setIsFormOpen(false);
      } catch {
        console.error('Не удалось сохранить услугу на бэкенде');
      }
    })();
  };

  const handleDeleteService = (id: string) => {
    haptic.impact('medium');
    void (async () => {
      try {
        await deleteService(id);
      } catch {
        console.error('Не удалось удалить услугу через FastAPI');
      }
    })();
  };

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
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
            <span className="text-2xl mb-2">✂️</span>
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg text-sm active:scale-98"
        >
          + Добавить новую услугу
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
