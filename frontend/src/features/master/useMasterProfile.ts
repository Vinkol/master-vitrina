import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import { getMasterProfileApi, updateMasterProfileApi } from '../../shared/api/masterApi';
import type { MasterProfile } from '../../store/types';

export function useMasterProfile() {
  const queryClient = useQueryClient();
  const masterId = useBookingStore((state) => state.currentMasterId);
  const token = useBookingStore((state) => state.accessToken);
  const setMasterProfileInZustand = useBookingStore((state) => state.updateProfileInDB);
  const profileQuery = useQuery({
    queryKey: ['masterProfile', masterId],
    queryFn: () => getMasterProfileApi(masterId!, token),
    enabled: !!masterId,
    meta: {
      onSuccess: (data: MasterProfile) => {
        void setMasterProfileInZustand(data);
      },
    },
  });

  const profileMutation = useMutation({
    mutationFn: (fields: Partial<MasterProfile>) => updateMasterProfileApi(fields, token),
    onMutate: (newFields) => {
      void setMasterProfileInZustand(newFields);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masterProfile', masterId] });
    },
    onError: (err) => {
      console.error('Не удалось обновить профиль на сервере:', err);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: profileMutation.mutateAsync,
    isSaving: profileMutation.isPending,
  };
}
