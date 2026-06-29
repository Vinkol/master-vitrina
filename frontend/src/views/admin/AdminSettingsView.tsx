import React, { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { PageHeader } from '../../shared/ui/page-header/PageHeader';
import { ChevronRight, Languages, Palette } from 'lucide-react';
import { CurrencySettingsRow } from '../../components/admin/CurrencySettingsRow';
import { useMasterProfile } from '../../features/master/useMasterProfile';
import { Loader } from '../../shared/ui/loader/Loader';

export const AdminSettingsView: React.FC = () => {
  const setScreen = useBookingStore((state) => state.setScreen);
  const { profile: masterProfile, updateProfile, isSaving, isLoading } = useMasterProfile();
  const [currency, setCurrency] = useState<string>(() => masterProfile?.currency || 'RUB');

  if (isLoading || !masterProfile) {
    return <Loader text="Загрузка настроек..." />;
  }

  const onSaveSubmit = () => {
    updateProfile({ currency })
      .then(() => {
        setScreen('admin-dashboard');
      })
      .catch((error) => {
        console.error('Ошибка при сохранении настроек:', error);
      });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-5 text-slate-800 select-none animate-fadeIn pb-24">
      {/* ШАПКА */}
      <PageHeader
        title="Общие настройки"
        subtitle="Управление конфигурацией витрины"
        onBackClick={() => setScreen('admin-dashboard')}
        onSaveClick={onSaveSubmit}
        isSaving={isSaving}
        saveButtonText="Сохранить"
      />

      {/* БЛОК НАСТРОЕК */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs mt-2">
        {/* НАСТРОЙКИ ВАЛЮТЫ */}
        <CurrencySettingsRow
          currentCurrency={currency}
          onSelectCurrency={(code) => setCurrency(code)}
          disabled={isSaving}
        />

        <div className="mx-4 h-px bg-slate-100" />

        {/* ВНЕШНИЙ ВИД */}
        <div className="flex items-center justify-between p-4 opacity-50 bg-slate-50/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 leading-none">Тема</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Светлая / Темная тема</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
              Скоро
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        <div className="mx-4 h-px bg-slate-100" />

        {/* ЯЗЫК */}
        <div className="flex items-center justify-between p-4 opacity-50 bg-slate-50/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 leading-none">Язык</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Локализация системы</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
              Скоро
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>
      </div>
      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 text-left">
        <p className="text-[10px] font-medium text-slate-400 text-center px-4 leading-normal">
          Данные сохраняются только после нажатия кнопки «Сохранить». Выбранная валюта автоматически
          применится ко всем вашим услугам, карточкам записи и витрине бронирования для клиентов.
        </p>
      </div>
    </div>
  );
};
