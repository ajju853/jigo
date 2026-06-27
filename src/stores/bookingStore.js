import { create } from 'zustand';
import { bookingAPI } from '../api/client';
import useAuthStore from './authStore';

const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  fetchBookings: async (filters = {}) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Not authenticated' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getMyBookings(filters, token);
      const data = response.data || response;
      set({
        bookings: data.bookings || data,
        pagination: data.pagination || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch bookings' });
    }
  },

  fetchBooking: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Not authenticated' });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getById(id, token);
      const data = response.data || response;
      set({ currentBooking: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch booking' });
      return null;
    }
  },

  createBooking: async (bookingData) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Not authenticated' });
      return { success: false, error: 'Not authenticated' };
    }
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.create(bookingData, token);
      const data = response.data || response;
      set({ isLoading: false });
      await get().fetchBookings();
      return { success: true, booking: data };
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to create booking' });
      return { success: false, error: error.message };
    }
  },

  updateBooking: async (id, data) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.updateStatus(id, data.status, data.cancellationReason, token);
      set({ isLoading: false });
      await get().fetchBookings();
      return { success: true, booking: response.data || response };
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to update booking' });
      return { success: false, error: error.message };
    }
  },

  cancelBooking: async (id, reason) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    set({ isLoading: true, error: null });
    try {
      await bookingAPI.updateStatus(id, 'cancelled', reason, token);
      set({ isLoading: false });
      await get().fetchBookings();
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to cancel booking' });
      return { success: false, error: error.message };
    }
  },

  confirmBooking: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.updateStatus(id, 'confirmed', null, token);
      set({ isLoading: false });
      await get().fetchBookings();
      return { success: true, booking: response.data || response };
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to confirm booking' });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useBookingStore;
