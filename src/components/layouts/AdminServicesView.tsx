import { useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import type { Service } from '../../types';

export function AdminServicesView() {
  const { services, addService, updateService, deleteService, setScreen } = useBookingStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Ключевой стейт: если null — мы создаем новую услугу, если объект Service — мы её редактируем
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Локальные стейты для полей формы
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');

  // Открытие формы в режиме создания
  const handleOpenCreate = () => {
    setEditingService(null);
    setTitle('');
    setPrice('');
    setDuration('60');
    setDescription('');
    setIsFormOpen(true);
  };

  // Открытие формы в режиме редактирования (подставляем данные)
  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setDescription(service.description || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !duration) return;

    const serviceData = {
      title,
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
    <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-slate-50 min-h-screen text-slate-800 pb-24 select-none">
      {/* Шапка навигации */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={() => setScreen('admin-dashboard')}
          className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl text-indigo-600 transition-all text-sm font-bold"
        >
          ← Назад
        </button>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Управление прайсом</h3>
          <p className="text-xs text-slate-400">Нажми на услугу для редактирования</p>
        </div>
      </div>

      {/* Список услуг */}
      <div className="space-y-2.5">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm flex justify-between items-center group animate-fadeIn cursor-pointer transition-all active:scale-[0.99]"
          >
            <div onClick={() => handleOpenEdit(service)} className="space-y-0.5 flex-1 pr-4">
              <div className="flex items-center space-x-2">
                <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                  {service.title}
                </p>
                <span className="text-[10px] text-slate-300 font-medium">✏️</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                ⏱ {service.duration} мин ·{' '}
                <span className="text-indigo-600 font-semibold">{service.price} ₽</span>
              </p>
              {service.description && (
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                  {service.description}
                </p>
              )}
            </div>

            {/* Кнопка удаления */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteService(service.id);
              }}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-red-100"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Плавающая нижняя кнопка */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
        <button
          onClick={handleOpenCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-100 text-sm active:scale-[0.99]"
        >
          + Добавить новую услугу
        </button>
      </div>

      {/* УНИВЕРСАЛЬНАЯ ШТОРКА (СОЗДАНИЕ / РЕДАКТИРОВАНИЕ) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />

          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />

            {/* Меняем заголовок шторки динамически */}
            <h4 className="text-base font-bold text-slate-900">
              {editingService ? `Редактирование: ${editingService.title}` : 'Новая услуга'}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Название услуги:
              </label>
              <input
                type="text"
                required
                placeholder="Например: Аппаратный педикюр"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Описание услуги:
              </label>
              <textarea
                placeholder="Что входит в стоимость, какие материалы используются..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Цена (₽):</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Длительность (мин):
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-semibold text-center appearance-none"
                >
                  <option value="30">30 мин</option>
                  <option value="45">45 мин</option>
                  <option value="60">1 час</option>
                  <option value="90">1.5 часа</option>
                  <option value="120">2 часа</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex space-x-2.5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold py-3 rounded-xl border border-slate-200 transition-all text-sm active:scale-95"
              >
                Отмена
              </button>

              {/* Меняем текст кнопки в зависимости от режима */}
              <button
                type="submit"
                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm active:scale-95"
              >
                {editingService ? 'Сохранить изменения' : 'Создать услугу'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
