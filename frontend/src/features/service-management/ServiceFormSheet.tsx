import type { FormEvent, ChangeEvent } from 'react';
import type { Service } from '../../types';
import { haptic } from '../../shared/lib/haptic/haptic';
import { useBookingStore } from '../../store/useBookingStore';

interface ServiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingService: Service | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  onSave: (e: FormEvent) => void;
}

export function ServiceFormSheet({
  isOpen,
  onClose,
  editingService,
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  duration,
  setDuration,
  onSave,
}: ServiceFormSheetProps) {
  const masterCurrency = useBookingStore((state) => state.masterProfile?.currency) || 'RUB';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={() => {
          haptic.impact('light');
          onClose();
        }}
      />

      <form
        onSubmit={onSave}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slideUp shadow-2xl border-t border-slate-100 space-y-4"
      >
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
        <h4 className="text-base font-black text-slate-900">
          {editingService ? `Редактирование: ${editingService.title}` : 'Новая услуга'}
        </h4>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Название услуги:
          </label>
          <input
            type="text"
            required
            placeholder="Например: Аппаратный педикюр"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-medium text-slate-700"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Описание услуги:
          </label>
          <textarea
            placeholder="Что входит в стоимость, какие материалы используются..."
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 leading-relaxed resize-none font-medium text-slate-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Цена ({masterCurrency}):
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="2500"
              value={price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-black text-center text-slate-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Длительность:
            </label>
            <select
              value={duration}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setDuration(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-sm bg-slate-50/50 font-bold text-center text-slate-700 appearance-none cursor-pointer"
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
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl border border-slate-200 transition-all text-sm active:scale-95"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm active:scale-95"
          >
            {editingService ? 'Сохранить' : 'Создать услугу'}
          </button>
        </div>
      </form>
    </div>
  );
}
