import { create } from 'zustand';
import { messageAPI } from '../api/client';
import useAuthStore from './authStore';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Not authenticated' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await messageAPI.getConversations(token);
      const data = response.data || response;
      const conversations = Array.isArray(data) ? data : data.conversations || [];
      set({ conversations, isLoading: false });

      const active = get().activeConversation;
      if (active) {
        const updatedActive = conversations.find(c => c.id === active.id);
        if (updatedActive) set({ activeConversation: updatedActive });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to fetch conversations', isLoading: false });
    }
  },

  setActiveConversation: (conv) => {
    const messages = conv.messages || [];
    set({ activeConversation: conv, messages });
  },

  sendMessage: async (receiverId, content, messageType = 'text') => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');
    try {
      const response = await messageAPI.send({ receiverId, content, messageType }, token);
      const data = response.data || response;
      const newMessage = data.message || data;

      set(state => ({
        messages: [...state.messages, newMessage],
      }));

      await get().fetchConversations();
      return newMessage;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  markConversationRead: async (otherUserId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      await messageAPI.markConversationRead(otherUserId, token);
    } catch (error) {
      console.warn('Failed to mark conversation read:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useChatStore;
