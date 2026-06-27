import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingAPI } from '../api/client';
import useAuthStore from '../stores/authStore';

export const useBookings = (filters = {}, options = {}) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingAPI.getMyBookings(filters, token),
    enabled: isAuthenticated,
    staleTime: 60000,
    ...options,
  });
};

export const useBooking = (id, options = {}) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingAPI.getById(id, token),
    enabled: !!id && isAuthenticated,
    staleTime: 30000,
    ...options,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (data) => bookingAPI.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ id, status, cancellationReason }) => bookingAPI.updateStatus(id, status, cancellationReason, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['booking', variables.id]);
      queryClient.invalidateQueries(['bookings']);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.updateStatus(id, 'cancelled', reason, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['booking', variables.id]);
      queryClient.invalidateQueries(['bookings']);
    },
  });
};
