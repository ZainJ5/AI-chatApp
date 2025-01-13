// useConversation.js
import { create } from 'zustand';

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (newSelectedConversation) => {
    const currentSelected = get().selectedConversation;
    if (!newSelectedConversation || currentSelected?._id !== newSelectedConversation._id) {
      set({ selectedConversation: newSelectedConversation, messages: [] });
    }  
  },

  messages: [],
  setMessages: (messages) => set({ messages }),
}));

export default useConversation;