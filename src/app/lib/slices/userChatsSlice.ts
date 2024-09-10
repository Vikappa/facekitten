import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDetails, Chat, Message } from '@/app/utils/StorageDataTypes'

interface UserChatState {
    chats: Chat[]
}

const initialState: UserChatState = {
    chats: []
};

const userChatsSlice = createSlice({
  name: 'userChats',
  initialState,
  reducers: {
    createChat:
    (state, action:PayloadAction<{chatWith:UserDetails}>) => {
        if(!state.chats.some((chat:Chat) => (chat.chatWith.userName === action.payload.chatWith.userName))) {
            state.chats.push({
                chatWith: action.payload.chatWith,
                messages: [],
                id: state.chats.length + 1,
                lastMessage: '',
                lastMessageTime: '',
                lastMessageStatus: ''
            })
        }
    },
    addCasualUserMessageFromUser:
    (state, action:PayloadAction<{chatWith:UserDetails, message: Message}>) => {
        const { chatWith, message } = action.payload
        const target = state.chats.find((chat:Chat) => (chat.chatWith.userName === chatWith.userName))
        if(target && message) {
            target.messages.push(message)
        } else {
            if(message){
                state.chats.push({
                    chatWith: chatWith,
                    messages: [message],
                    id: state.chats.length + 1,
                    lastMessage: message.message,
                    lastMessageTime: message.timestamp,
                    lastMessageStatus: ''
                })
            }
        }
    },
    initializeUserChatsSlice: (state) => {
        state.chats = []
    }
  },
})

export const { createChat, addCasualUserMessageFromUser, initializeUserChatsSlice } = userChatsSlice.actions
export default userChatsSlice.reducer;
