import { useRef, useCallback } from 'react';
import { CrmFilterTabs } from '../../components/admin/CrmFilterTabs';
import { CrmEmptyState } from '../../components/admin/CrmEmptyState';
import { ClientCrmCard } from '../../entities/client/ClientCrmCard';
import { Search, Users, X } from 'lucide-react';

import { useClientsCrm } from './useClientsCrm';
import { useIntersectionObserver } from '../../views/admin/useIntersectionObserver';
import { haptic } from '../../shared/lib/haptic/haptic';
import { ClientCrmSkeletonCard } from '../../components/admin/ClientCrmSkeletonCard';

export function AdminClientsCrmView() {
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
    onLoadMore: () => {
      void loadMore();
    },
  });

  const handleToggleBlock = useCallback(
    (phone: string, isBlocked: boolean) => {
      void toggleBlockClient(phone, isBlocked);
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
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-2 z-40 animate-fadeIn">
        <div className="min-w-0 pl-1 space-y-0.5">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50/70 px-2 py-0.5 rounded-md">
            CRM
          </span>
          <h2 className="text-sm font-black text-slate-800 tracking-tight leading-tight truncate pt-0.5">
            База клиентов
          </h2>
        </div>

        <div className="flex items-center shrink-0">
          <div className="relative group p-2.5 bg-linear-to-tr from-indigo-50 to-indigo-100/50 text-indigo-600 rounded-xl border border-indigo-100/80 shadow-xs overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
            <Users
              className="w-4 h-4 relative z-10 text-indigo-600 animate-[pulse_3s_infinite_ease-in-out]"
              strokeWidth={2.25}
            />
          </div>
        </div>
      </div>

      {/* ПОИСК */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xs p-1 flex items-center">
        <Search
          className="ml-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0"
          strokeWidth={2}
        />
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
            <X className="w-3.5 h-3.5 animate-fadeIn" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ТАБЫ ФИЛЬТРАЦИИ */}
      <CrmFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

      {/* СПИСОК КЛИЕНТОВ */}
      <div className="space-y-2.5">
        {isLoading && filteredClients.length === 0 ? (
          <>
            <ClientCrmSkeletonCard />
            <ClientCrmSkeletonCard />
            <ClientCrmSkeletonCard />
          </>
        ) : filteredClients.length === 0 ? (
          <CrmEmptyState />
        ) : (
          filteredClients.map((client) => (
            <ClientCrmCard
              key={`${client.client_name}_${client.client_phone}`}
              client={client}
              onToggleBlock={() => handleToggleBlock(client.client_phone, client.is_blocked)}
            />
          ))
        )}

        {/* СЕНСОРНЫЙ ТРИГГЕР + СПИННЕР ПОДГРУЗКИ */}
        <div ref={loadMoreTriggerRef} className="w-full space-y-2.5">
          {isLoading && filteredClients.length > 0 && (
            <>
              <ClientCrmSkeletonCard />
              <ClientCrmSkeletonCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
