import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../api/client';
import useAuthStore from '../stores/authStore';

export const useProfiles = (filters = {}, options = {}) => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => profileAPI.browse(filters, token),
    staleTime: 30000,
    ...options,
  });
};

export const useProfile = (id, options = {}) => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => profileAPI.getById(id, token),
    enabled: !!id,
    staleTime: 60000,
    ...options,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ id, data }) => profileAPI.update(id, data, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['profile', variables.id]);
      queryClient.invalidateQueries(['profiles']);
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (id) => profileAPI.toggleFavorite(id, token),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries(['profiles']);
    },
  });
};
