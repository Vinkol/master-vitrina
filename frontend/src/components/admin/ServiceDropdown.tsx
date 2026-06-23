import { useState } from 'react';
import type { Service } from '../../types';
import { haptic } from '../../shared/lib/haptic/haptic';
import { ChevronDown, Briefcase, Clock, Check } from 'lucide-react';

interface ServiceDropdownProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export function ServiceDropdown({
  services,
  selectedService,
  onSelectService,
}: ServiceDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Выбор услуги *
      </label>

      {/* Главная кнопка селектора */}
      <button
        type="button"
        onClick={() => {
          haptic.impact('light');
          setIsOpen(!isOpen);
        }}
        className="w-full p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 focus:border-indigo-600 focus:bg-white text-sm font-bold text-slate-700 flex justify-between items-center transition-all active:scale-[0.99]"
      >
        {selectedService ? (
          <div className="flex items-center space-x-2 text-left">
            <span className="text-indigo-600 font-extrabold">{selectedService.title}</span>
            <span className="text-[11px] text-slate-400 font-medium">
              ({selectedService.price} ₽ · {selectedService.duration} мин)
            </span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">Выберите услугу из прайса</span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-300 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
          strokeWidth={2.5}
        />
      </button>

      {/* Выпадающее оверлей-меню */}
      {isOpen && (
        <>
          {/* Задник для закрытия при клике мимо */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-50 max-h-48 overflow-y-auto animate-fadeIn scrollbar-none">
            {services.length === 0 ? (
              <div className="p-5 flex flex-col items-center justify-center text-center text-xs text-slate-400 font-bold space-y-1.5">
                <Briefcase className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                <span>Прайс-лист услуг пока пуст</span>
              </div>
            ) : (
              services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => {
                      haptic.impact('medium');
                      onSelectService(service);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3.5 text-left flex justify-between items-center transition-colors text-xs font-bold ${
                      isSelected
                        ? 'bg-indigo-50/60 text-indigo-600'
                        : 'text-slate-700 hover:bg-slate-50/80 active:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate">{service.title}</p>
                      <div className="flex items-center text-slate-400 font-medium mt-1 space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" strokeWidth={2} />
                        <span>Длительность: {service.duration} мин</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center space-x-2">
                      <span
                        className={
                          isSelected
                            ? 'text-indigo-600 font-black'
                            : 'text-slate-500 font-extrabold'
                        }
                      >
                        {service.price} ₽
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" strokeWidth={3} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
