import { createSlice } from '@reduxjs/toolkit';
import { Chat, ChatMessage } from '../../Classes/Chat/Chats';
import { initialize } from 'next/dist/server/lib/render-server';

interface ChatState {
  activeChats: Chat[];
}

const initialState: ChatState = {
  activeChats: [],
};

export const chatSlices = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    initializeChats(state) {
      state.activeChats = [];
    },
    addChat(state, action) {
      state.activeChats.push(action.payload);
    },
    removeChat(state, action) {
      state.activeChats = state.activeChats.filter(
        (chat) => chat.id !== action.payload
      );
    },
    addMessageToChat(state, action) {
        const { chatId, message } = action.payload;
        const chat = state.activeChats.find((c) => c.id === chatId);
        if (chat) {
            chat.messages.push(message);
        }
    },
  },
});

export const { initializeChats, addChat, removeChat, addMessageToChat } = chatSlices.actions;
export default chatSlices.reducer;
