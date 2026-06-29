import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import {
  getAppointmentsApi,
  createAppointmentApi,
  deleteAppointmentApi,
} from '../../shared/api/masterApi';

export function useAppointments() {
  const queryClient = useQueryClient();
  const masterId = useBookingStore((state) => state.currentMasterId);
  const token = useBookingStore((state) => state.accessToken);
  const setAppointmentsLocally = useBookingStore((state) => state.setAppointmentsLocally);

  const selectedService = useBookingStore((state) => state.selectedService);
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);

  // Кэширование журнала записей
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', masterId],
    queryFn: () => getAppointmentsApi(masterId!, token),
    enabled: !!masterId,
  });

  const fetchedAppointments = appointmentsQuery.data;
  useEffect(() => {
    if (fetchedAppointments) {
      setAppointmentsLocally(fetchedAppointments);
    }
  }, [fetchedAppointments, setAppointmentsLocally]);

  // Мутация создания записи визита
  const createAppointmentMutation = useMutation({
    mutationFn: (clientData: { name: string; phone: string }) => {
      if (!selectedService || !selectedDate || !selectedTime || !masterId) {
        throw new Error('Недостаточно данных для создания записи');
      }
      return createAppointmentApi({
        master_id: masterId,
        service_id: selectedService.id,
        date: selectedDate.split('T')[0],
        time: selectedTime,
        client_name: clientData.name.trim(),
        client_phone: clientData.phone.trim(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments', masterId] });
    },
  });

  // Мутация удаления записи визита
  const deleteAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => deleteAppointmentApi(appointmentId, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments', masterId] });
    },
    onError: (err) => {
      console.error('Не удалось удалить запись:', err);
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    isError: appointmentsQuery.isError,
    createAppointment: createAppointmentMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    isDeleting: deleteAppointmentMutation.isPending,
  };
}
