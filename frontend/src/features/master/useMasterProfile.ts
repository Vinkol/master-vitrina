import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore';
import { getMasterProfileApi, updateMasterProfileApi } from '../../shared/api/masterApi';
import type { MasterProfile } from '../../store/types';

export function useMasterProfile() {
  const queryClient = useQueryClient();

  const currentMasterId = useBookingStore((state) => state.currentMasterId);
  const token = useBookingStore((state) => state.accessToken);
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated);
  const isRegisteredMaster = useBookingStore((state) => state.isRegisteredMaster);
  const user = useBookingStore((state) => state.user); // Достаем текущего юзера сессии
  const setMasterProfileInZustand = useBookingStore((state) => state.updateProfileInDB);

  const isViewingOwnAdmin = !!(
    isAuthenticated &&
    isRegisteredMaster &&
    user?.id === currentMasterId
  );

  const profileQuery = useQuery({
    queryKey: ['masterProfile', currentMasterId],
    queryFn: () => getMasterProfileApi(currentMasterId!, token),
    enabled: !!currentMasterId && isViewingOwnAdmin,

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
      void queryClient.invalidateQueries({ queryKey: ['masterProfile', currentMasterId] });
    },
    onError: (err) => {
      console.error('Не удалось обновить профиль на сервере:', err);
    },
  });

  return {
    profile: profileQuery.data,
    // Лоадер крутится только если запрос реально активен и ждет сеть
    isLoading: profileQuery.isLoading && isViewingOwnAdmin,
    isError: profileQuery.isError,
    updateProfile: profileMutation.mutateAsync,
    isSaving: profileMutation.isPending,
  };
}
