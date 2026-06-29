import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import { getCrmClientsApi, blockClientApi, unblockClientApi } from '../../shared/api/masterApi';

export type CrmFilter = 'all' | 'new' | 'loyal' | 'active' | 'blocked';

const PAGE_SIZE = 20;

export function useClientsCrm() {
  const queryClient = useQueryClient();

  const masterId = useBookingStore((state) => state.currentMasterId);
  const localBlock = useBookingStore((state) => state.blockClient);
  const localUnblock = useBookingStore((state) => state.unblockClient);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<CrmFilter>('all');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), delay);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['crmClients', masterId, debouncedSearch, activeFilter],
    queryFn: ({ pageParam = 0 }) =>
      getCrmClientsApi({
        masterId: masterId!,
        search: debouncedSearch,
        filter: activeFilter,
        page: pageParam,
        size: PAGE_SIZE,
      }),
    initialPageParam: 0,
    enabled: !!masterId,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

  const filteredClients = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter: CrmFilter) => {
    setActiveFilter((current) => (current === filter ? current : filter));
  }, []);

  // Мутация блокировки клиента
  const blockMutation = useMutation({
    mutationFn: (phone: string) => blockClientApi(masterId!, phone),
    onMutate: (phone) => {
      localBlock(phone);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['crmClients'] });
    },
  });

  // Мутация разблокировки клиента
  const unblockMutation = useMutation({
    mutationFn: (phone: string) => unblockClientApi(masterId!, phone),
    onMutate: (phone) => {
      localUnblock(phone);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['crmClients'] });
    },
  });

  const toggleBlockClient = useCallback(
    async (clientPhone: string, currentlyBlocked: boolean) => {
      if (currentlyBlocked) {
        await unblockMutation.mutateAsync(clientPhone);
      } else {
        await blockMutation.mutateAsync(clientPhone);
      }
    },
    [blockMutation, unblockMutation],
  );

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    activeFilter,
    setActiveFilter: handleFilterChange,
    filteredClients,
    loadMore,
    hasMoreClients: hasNextPage,
    toggleBlockClient,
    isLoading: isLoading || isFetchingNextPage,
  };
}
