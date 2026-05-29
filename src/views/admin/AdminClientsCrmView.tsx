import { useRef, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { CrmFilterTabs } from '../../components/admin/CrmFilterTabs';
import { ClientCrmCard } from '../../components/admin/ClientCrmCard';
import { CrmEmptyState } from '../../components/admin/CrmEmptyState';
import { CrmSkeletonLoader } from '../../components/admin/CrmSkeletonLoader';

import { useClientsCrm } from './useClientsCrm';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useBookingStore } from '../../store/useBookingStore';
import { haptic } from '../../utils/haptic';

export function AdminClientsCrmView() {
  const setScreen = useBookingStore((state) => state.setScreen);

  const {
    isLoading,
    hasMoreClients,
    loadMore,
    toggleBlockClient,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredClients,
  } = useClientsCrm();

  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver({
    triggerRef: loadMoreTriggerRef,
    isLoading: isLoading,
    hasMore: hasMoreClients,
    onLoadMore: loadMore,
  });

  const handleToggleBlock = useCallback(
    (name: string, isBlocked: boolean) => {
      toggleBlockClient(name, isBlocked);
    },
    [toggleBlockClient],
  );

  const handleClearSearch = () => {
    haptic.impact('light');
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen text-slate-800 pb-28 select-none animate-fadeIn">
      {/* ХЕДЕР */}
      <PageHeader
        title="База клиентов"
        subtitle="CRM-аналитика системы"
        onBackClick={() => setScreen('admin-placeholder-main')}
      />

      {/* ПОИСК */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xs p-1 flex items-center">
        <span className="pl-3 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2.5 pl-2 text-xs font-bold text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="pr-3 text-slate-300 hover:text-slate-500 font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* ТАБЫ ФИЛЬТРАЦИИ */}
      <CrmFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

      {/* СПИСОК КЛИЕНТОВ */}
      <div className="space-y-2.5">
        {filteredClients.length === 0 && !isLoading ? (
          <CrmEmptyState />
        ) : (
          filteredClients.map((client) => (
            <ClientCrmCard
              key={`${client.client_name}_${client.client_phone}`}
              client={client}
              onToggleBlock={handleToggleBlock}
            />
          ))
        )}

        {/* СЕНСОРНЫЙ ТРИГГЕР + СПИННЕР ПОДГРУЗКИ */}
        <div
          ref={loadMoreTriggerRef}
          className="w-full py-6 flex items-center justify-center min-h-13"
        >
          <CrmSkeletonLoader isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
