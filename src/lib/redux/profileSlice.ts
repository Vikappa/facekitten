import { Database } from "@/types/database.types";
import type {
    ChatData,
    ChatThreadData,
    ChatThreadProfileMetadata,
} from "@/lib/interfaces/CommonInterfaces";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    confirmedAccount: boolean;
    dataDiNascita: string | null;
    giocattoloPreferito: string;
    location: string;
    tipoCuccia: Database["public"]["Enums"]["Lettino"] | null;
}

export interface ProfileState {
    currentProfile: UserProfile | null;
    chats: ChatThreadData[];
}

export const initialProfileState: ProfileState = {
    currentProfile: null,
    chats: [],
};

interface ChatMutationPayload {
    withProfile: ChatThreadProfileMetadata;
    chat: ChatData;
    lastMessageAt?: string;
}

interface RemoveChatFromThreadPayload {
    withProfileId: string;
    chatId: string;
}

function findThreadIndexByProfileId(chatThreads: ChatThreadData[], withProfileId: string): number {
    return chatThreads.findIndex((thread) =>
        thread.withProfile.id === withProfileId
    );
}

function resolveLastMessageAt(
    chat: ChatData,
    explicitLastMessageAt?: string,
    fallbackLastMessageAt?: string
): string {
    return explicitLastMessageAt ?? chat.createdAt ?? fallbackLastMessageAt ?? new Date().toISOString();
}

const profileSlice = createSlice({
    name: "profile",
    initialState: initialProfileState,
    reducers: {
        hydrateProfileState(state, action: PayloadAction<ProfileState>) {
            state.currentProfile = action.payload.currentProfile;
            state.chats = action.payload.chats;
        },
        setCurrentProfile(state, action: PayloadAction<UserProfile>) {
            const previousProfileId = state.currentProfile?.id;
            state.currentProfile = action.payload;
            if (previousProfileId && previousProfileId !== action.payload.id) {
                state.chats = [];
            }
        },
        patchCurrentProfile(state, action: PayloadAction<Partial<UserProfile>>) {
            if (!state.currentProfile) {
                return;
            }

            state.currentProfile = {
                ...state.currentProfile,
                ...action.payload,
            };
        },
        clearCurrentProfile(state) {
            state.currentProfile = null;
            state.chats = [];
        },
        setChats(state, action: PayloadAction<ChatThreadData[]>) {
            state.chats = action.payload;
        },
        setChatThread(state, action: PayloadAction<ChatThreadData>) {
            const thread = action.payload;
            const threadIndex = findThreadIndexByProfileId(state.chats, thread.withProfile.id);

            if (thread.chats.length === 0) {
                if (threadIndex !== -1) {
                    state.chats.splice(threadIndex, 1);
                }
                return;
            }

            if (threadIndex === -1) {
                state.chats.push(thread);
                return;
            }

            state.chats[threadIndex] = thread;
        },
        addChatToThread(state, action: PayloadAction<ChatMutationPayload>) {
            const { withProfile, chat, lastMessageAt } = action.payload;
            const threadIndex = findThreadIndexByProfileId(state.chats, withProfile.id);
            const resolvedLastMessageAt = resolveLastMessageAt(chat, lastMessageAt);

            if (threadIndex === -1) {
                state.chats.push({
                    withProfile,
                    chats: [chat],
                    lastMessageAt: resolvedLastMessageAt,
                });
                return;
            }

            state.chats[threadIndex].withProfile = withProfile;
            state.chats[threadIndex].chats.push(chat);
            state.chats[threadIndex].lastMessageAt = resolvedLastMessageAt;
        },
        upsertChatInThread(state, action: PayloadAction<ChatMutationPayload>) {
            const { withProfile, chat, lastMessageAt } = action.payload;
            const threadIndex = findThreadIndexByProfileId(state.chats, withProfile.id);

            if (threadIndex === -1) {
                state.chats.push({
                    withProfile,
                    chats: [chat],
                    lastMessageAt: resolveLastMessageAt(chat, lastMessageAt),
                });
                return;
            }

            const messageIndex = state.chats[threadIndex].chats.findIndex((entry) => entry.chatId === chat.chatId);
            if (messageIndex === -1) {
                state.chats[threadIndex].chats.push(chat);
            } else {
                state.chats[threadIndex].chats[messageIndex] = chat;
            }

            state.chats[threadIndex].withProfile = withProfile;
            state.chats[threadIndex].lastMessageAt = resolveLastMessageAt(
                chat,
                lastMessageAt,
                state.chats[threadIndex].lastMessageAt
            );
        },
        removeChatFromThread(state, action: PayloadAction<RemoveChatFromThreadPayload>) {
            const { withProfileId, chatId } = action.payload;
            const threadIndex = findThreadIndexByProfileId(state.chats, withProfileId);

            if (threadIndex === -1) {
                return;
            }

            state.chats[threadIndex].chats = state.chats[threadIndex].chats.filter((chat) => chat.chatId !== chatId);
            if (state.chats[threadIndex].chats.length === 0) {
                state.chats.splice(threadIndex, 1);
                return;
            }

            const latestChat = state.chats[threadIndex].chats[state.chats[threadIndex].chats.length - 1];
            if (latestChat?.createdAt) {
                state.chats[threadIndex].lastMessageAt = latestChat.createdAt;
            }
        },
        removeChatThread(state, action: PayloadAction<string>) {
            const threadIndex = findThreadIndexByProfileId(state.chats, action.payload);
            if (threadIndex === -1) {
                return;
            }

            state.chats.splice(threadIndex, 1);
        },
        clearChats(state) {
            state.chats = [];
        },
    },
});

export const {
    hydrateProfileState,
    setCurrentProfile,
    patchCurrentProfile,
    clearCurrentProfile,
    setChats,
    setChatThread,
    addChatToThread,
    upsertChatInThread,
    removeChatFromThread,
    removeChatThread,
    clearChats,
} = profileSlice.actions;
export default profileSlice.reducer;
