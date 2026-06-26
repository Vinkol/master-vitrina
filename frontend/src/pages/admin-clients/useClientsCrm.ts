import { useState, useEffect, useCallback, useRef } from 'react';
import { useBookingStore } from '../../store/useBookingStore';

export type CrmFilter = 'all' | 'new' | 'loyal' | 'active' | 'blocked';

export function useClientsCrm() {
  const crmClients = useBookingStore((state) => state.crmClients);
  const hasMoreClients = useBookingStore((state) => state.hasMoreClients);
  const fetchCrmClients = useBookingStore((state) => state.fetchCrmClients);
  const toggleBlock = useBookingStore((state) => state.blockClient);
  const toggleUnblock = useBookingStore((state) => state.unblockClient);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<CrmFilter>('all');
  const [page, setPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((filter: CrmFilter) => {
    setActiveFilter((current) => {
      if (current === filter) return current;
      setIsLoading(true);
      setPage(0);
      return filter;
    });
  }, []);

  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    isFetchingRef.current = true;

    const delayDebounce = setTimeout(async () => {
      try {
        await fetchCrmClients(searchQuery, activeFilter, 0);
      } catch (error) {
        console.error('Ошибка при первичной загрузке фильтра CRM:', error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }, delay);

    return () => {
      clearTimeout(delayDebounce);
      isFetchingRef.current = false;
    };
  }, [searchQuery, activeFilter, fetchCrmClients]);

  const loadMore = useCallback(async () => {
    if (isLoading || isFetchingRef.current || !hasMoreClients) return;

    setIsLoading(true);
    isFetchingRef.current = true;

    const nextPage = page + 1;
    setPage(nextPage);

    try {
      await fetchCrmClients(searchQuery, activeFilter, nextPage);
    } catch (error) {
      console.error('Ошибка подгрузки пагинации CRM:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasMoreClients, searchQuery, activeFilter, page, fetchCrmClients, isLoading]);

  const toggleBlockClient = useCallback(
    async (clientPhone: string, currentlyBlocked: boolean) => {
      setIsLoading(true);
      isFetchingRef.current = true;
      try {
        if (currentlyBlocked) {
          await toggleUnblock(clientPhone);
        } else {
          await toggleBlock(clientPhone);
        }
      } catch (error) {
        console.error('Ошибка изменения статуса блокировки клиента:', error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [toggleBlock, toggleUnblock],
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
