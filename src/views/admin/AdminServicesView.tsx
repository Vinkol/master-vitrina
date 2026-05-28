import { useState } from 'react';
import type { FormEvent } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { ServiceCard } from '../../components/admin/ServiceCard';
import { ServiceFormSheet } from '../../features/service-management/ServiceFormSheet';
import type { Service } from '../../types';

export function AdminServicesView() {
  const { services, addService, updateService, deleteService, setScreen } = useBookingStore();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [description, setDescription] = useState<string>('');

  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleOpenCreate = () => {
    triggerHaptic('light');
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

    triggerHaptic('medium');

    const serviceData = {
      title: title.trim(),
      price: Number(price),
      duration: Number(duration),
      description: description.trim(),
    };

    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService(serviceData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-slate-50 min-h-screen text-slate-800 pb-36 select-none animate-fadeIn">
      {/* Шапка навигации */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
        <button
          onClick={() => {
            triggerHaptic('light');
            setScreen('admin-dashboard');
          }}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h3 className="font-black text-slate-800 text-sm">Управление прайсом</h3>
          <p className="text-xs text-slate-400 font-medium">Нажми на услугу для редактирования</p>
        </div>
      </div>

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
              onDelete={deleteService}
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

      {/* Исправлено: Вынесенная универсальная шторка формы */}
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
