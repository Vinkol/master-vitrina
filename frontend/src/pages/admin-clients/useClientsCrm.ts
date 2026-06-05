import { useState, useEffect, useCallback } from 'react';
import { useBookingStore } from '../../store/useBookingStore';

export type CrmFilter = 'all' | 'new' | 'loyal' | 'active' | 'blocked';

export function useClientsCrm() {
  const crmClients = useBookingStore((state) => state.crmClients);
  const hasMoreClients = useBookingStore((state) => state.hasMoreClients);
  const fetchCrmClients = useBookingStore((state) => state.fetchCrmClients);
  const blockClient = useBookingStore((state) => state.blockClient);
  const unblockClient = useBookingStore((state) => state.unblockClient);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<CrmFilter>('all');
  const [page, setPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((filter: CrmFilter) => {
    setActiveFilter(filter);
    setIsLoading(true);
    setPage(0);
  }, []);

  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const delayDebounce = setTimeout(async () => {
      try {
        await fetchCrmClients(searchQuery, activeFilter, 0);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeFilter, fetchCrmClients, isLoading]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMoreClients) return;

    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      await fetchCrmClients(searchQuery, activeFilter, nextPage);
    } finally {
      setIsLoading(false);
    }
  }, [hasMoreClients, searchQuery, activeFilter, page, fetchCrmClients, isLoading]);

  const toggleBlockClient = useCallback(
    async (clientPhone: string, currentlyBlocked: boolean) => {
      setIsLoading(true);
      try {
        if (currentlyBlocked) {
          await unblockClient(clientPhone);
        } else {
          await blockClient(clientPhone);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [blockClient, unblockClient],
  );

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    activeFilter,
    setActiveFilter: handleFilterChange,
    filteredClients: crmClients,
    loadMore,
    hasMoreClients,
    toggleBlockClient,
    isLoading,
    currentPage: page,
  };
}
