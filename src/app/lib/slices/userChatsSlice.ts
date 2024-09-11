import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDetails, Chat, Message } from '@/app/utils/StorageDataTypes'

interface UserChatState {
    chats: Chat[];
    openedChats: Chat[];
}

const initialState: UserChatState = {
    chats: [],
    openedChats: []
};

const userChatsSlice = createSlice({
  name: 'userChats',
  initialState,
  reducers: {
    createChat:
    (state, action:PayloadAction<{chatWith:UserDetails}>) => {
        const newChat = {
            chatWith: action.payload.chatWith,
            messages: [],
            id: state.chats.length + 1,
            lastMessage: '',
            lastMessageTime: '',
            lastMessageStatus: ''
        }

        if(!state.chats.some((chat:Chat) => (chat.chatWith.userName === action.payload.chatWith.userName))) {
            state.chats.push(newChat)
        }

        const chatAlreadyOpened = state.openedChats.some((chat: Chat) => chat.chatWith.userName === action.payload.chatWith.userName);

        if(!chatAlreadyOpened){
            if(state.openedChats.length >= 4){
                state.openedChats.shift()
            }
            state.openedChats.push(newChat)
        }
    },
    addCasualUserMessageFromUser:
    (state, action:PayloadAction<{chatWith:UserDetails, message: Message}>) => {
        const { chatWith, message } = action.payload
        const target = state.chats.find((chat:Chat) => (chat.chatWith.userName === chatWith.userName))

        const newChat = {
            chatWith: chatWith,
            messages: [message],
            id: state.chats.length + 1,
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            lastMessageStatus: ''
        }

        if(target && message) {
            target.messages.push(message)
        } else {
            if(message){
                state.chats.push(newChat)
            }
        }

        if(state.openedChats.length >= 4){
            state.openedChats.shift()
        }
        state.openedChats.push(newChat)
    },
    initializeUserChatsSlice: (state) => {
        state = initialState
    }, 
    closeChatWithUser: (state, action: PayloadAction<UserDetails>) => {
        state.openedChats = state.openedChats.filter(
            chat => chat.chatWith.userName !== action.payload.userName
        )
    }
  },
})

export const { createChat, addCasualUserMessageFromUser, initializeUserChatsSlice, closeChatWithUser } = userChatsSlice.actions
export default userChatsSlice.reducer;
