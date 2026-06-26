import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import {
  getServicesApi,
  addServiceApi,
  updateServiceApi,
  deleteServiceApi,
} from '../../shared/api/masterApi';
import type { Service } from '../../store/types';

export function useServices() {
  const queryClient = useQueryClient();
  const masterId = useBookingStore((state) => state.currentMasterId);
  const token = useBookingStore((state) => state.accessToken);
  const setServicesLocally = useBookingStore((state) => state.setServicesLocally);
  const servicesQuery = useQuery({
    queryKey: ['services', masterId],
    queryFn: () => getServicesApi(masterId!),
    enabled: !!masterId,
  });

  const fetchedServices = servicesQuery.data;
  useEffect(() => {
    if (fetchedServices) {
      setServicesLocally(fetchedServices);
    }
  }, [fetchedServices, setServicesLocally]);

  // Мутация добавления услуги
  const addServiceMutation = useMutation({
    mutationFn: (newService: Omit<Service, 'id'>) => addServiceApi(newService, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services', masterId] });
    },
  });

  // Мутация обновления услуги
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Service> }) =>
      updateServiceApi(id, fields, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services', masterId] });
    },
  });

  // Мутация удаления услуги
  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => deleteServiceApi(id, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services', masterId] });
    },
  });

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,

    addService: addServiceMutation.mutateAsync,
    isAdding: addServiceMutation.isPending,

    updateService: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,

    deleteService: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
  };
}
