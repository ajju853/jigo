import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI, profileAPI } from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const data = response.data || response;
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return data.user;
        } catch (error) {
          set({ isLoading: false, error: error.message || 'Login failed' });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const data = response.data || response;
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return data.user;
        } catch (error) {
          set({ isLoading: false, error: error.message || 'Registration failed' });
          throw error;
        }
      },

      logout: async () => {
        const { token, refreshToken } = get();
        try {
          await authAPI.logout(refreshToken, token);
        } catch (error) {
          console.warn('Logout API error:', error);
        }
        set({
          user: null, token: null, refreshToken: null,
          isAuthenticated: false, error: null,
        });
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isAuthenticated: false });
          return false;
        }
        try {
          const response = await authAPI.refreshToken(refreshToken);
          const data = response.data || response;
          set({ token: data.token, refreshToken: data.refreshToken, isAuthenticated: true });
          return true;
        } catch (error) {
          set({ token: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return null;
        }
        set({ isLoading: true });
        try {
          const response = await authAPI.getMe(token);
          const data = response.data || response;
          set({ user: data.user || data, isAuthenticated: true, isLoading: false });
          return data.user || data;
        } catch (error) {
          if (error.message.includes('401')) {
            const refreshed = await get().refreshAuthToken();
            if (refreshed) return get().fetchUser();
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
          return null;
        }
      },

      updateUser: async (data) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.update(data, token);
          const result = response.data || response;
          const updated = result.user || result;
          set({ user: updated, isLoading: false });
          return updated;
        } catch (error) {
          set({ isLoading: false, error: error.message || 'Update failed' });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'jigo_auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
