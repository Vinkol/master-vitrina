import { useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useClientsCrm } from './useClientsCrm';
import type { CrmFilter } from './useClientsCrm';
import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../utils/haptic';

const FILTER_TABS: { id: CrmFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Все', icon: '👥' },
  { id: 'new', label: 'Новые', icon: '🌱' },
  { id: 'loyal', label: 'Постоянные', icon: '👑' },
  { id: 'active', label: 'Активные', icon: '⚡' },
  { id: 'blocked', label: 'Чёрный список', icon: '🚫' },
];

export function AdminClientsCrmView() {
  const setScreen = useBookingStore((state) => state.setScreen);
  const crm = useClientsCrm();
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !crm.isLoading && crm.hasMoreClients) {
          crm.loadMore();
        }
      },
      {
        root: null,
        rootMargin: '150px',
        threshold: 0,
      },
    );

    observer.observe(trigger);

    return () => {
      observer.unobserve(trigger);
      observer.disconnect();
    };
  }, [crm.loadMore, crm.hasMoreClients, crm.isLoading, crm]);

  const handleFilterChange = (filterId: CrmFilter) => {
    haptic.impact('light');
    crm.setActiveFilter(filterId);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* ХЕДЕР */}
      <PageHeader
        title="База клиентов"
        subtitle="CRM-аналитика системы"
        onBackClick={() => setScreen('admin-dashboard')}
      />

      {/* ПОИСК */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xs p-1 flex items-center">
        <span className="pl-3 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={crm.searchQuery}
          onChange={(e) => crm.setSearchQuery(e.target.value)}
          className="w-full p-2.5 pl-2 text-xs font-bold text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
        />
        {crm.searchQuery && (
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              crm.setSearchQuery('');
            }}
            className="pr-3 text-slate-300 hover:text-slate-500 font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* ТАБЫ */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = crm.activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={`shrink-0 py-2 px-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* СПИСОК КЛИЕНТОВ */}
      <div className="space-y-2.5">
        {crm.filteredClients.length === 0 && !crm.isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 bg-white border border-dashed border-slate-200 rounded-3xl text-center animate-fadeIn">
            <span className="text-3xl mb-2">🍃</span>
            <p className="text-xs font-bold text-slate-400">Никого не найдено</p>
            <p className="text-[10px] text-slate-300 mt-0.5">В этой категории клиентов пока нет</p>
          </div>
        ) : (
          crm.filteredClients.map((client) => (
            <div
              key={`${client.client_name}_${client.client_phone}`}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center group animate-fadeIn"
            >
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-black text-slate-800 text-sm truncate">
                    {client.client_name}
                  </h4>

                  {/* Бейджи статуса */}
                  {client.is_blocked ? (
                    <span className="text-[8px] font-black uppercase tracking-wide bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md">
                      Блок
                    </span>
                  ) : client.visits_count >= 3 ? (
                    <span className="text-[8px] font-black uppercase tracking-wide bg-amber-50 text-amber-500 px-1.5 py-0.5 rounded-md">
                      VIP
                    </span>
                  ) : client.visits_count === 1 ? (
                    <span className="text-[8px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-500 px-1.5 py-0.5 rounded-md">
                      Новый
                    </span>
                  ) : null}

                  {client.has_future_appointment && !client.is_blocked && (
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                      title="Есть активная запись"
                    />
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-mono font-medium">
                  {client.client_phone}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Последний визит:{' '}
                  <span className="font-bold text-slate-600">{client.last_visit_date}</span>
                </p>
              </div>

              {/* Правая часть: Счётчик + Блокировка */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">
                    Визиты
                  </span>
                  <span className="text-base font-black text-indigo-600 block leading-tight">
                    {client.visits_count}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptic.impact('medium');
                    crm.toggleBlockClient(client.client_name, client.is_blocked);
                  }}
                  className={`p-2 rounded-xl border transition-all text-xs active:scale-95 ${
                    client.is_blocked
                      ? 'bg-rose-50 border-rose-100 text-rose-500 font-bold'
                      : 'bg-slate-50 border-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100'
                  }`}
                  title={client.is_blocked ? 'Разблокировать' : 'В черный список'}
                >
                  {client.is_blocked ? '🔓' : '🚫'}
                </button>
              </div>
            </div>
          ))
        )}

        {/* СЕНСОРНЫЙ ТРИГГЕР + СПИННЕР ПОДГРУЗКИ */}
        <div
          ref={loadMoreTriggerRef}
          className="w-full py-6 flex items-center justify-center min-h-13"
        >
          {crm.isLoading && (
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
              <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Загрузка клиентов...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
