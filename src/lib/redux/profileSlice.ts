import { Database } from "@/types/database.types";
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
}

export const initialProfileState: ProfileState = {
    currentProfile: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState: initialProfileState,
    reducers: {
        setCurrentProfile(state, action: PayloadAction<UserProfile>) {
            state.currentProfile = action.payload;
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
        },
    },
});

export const { setCurrentProfile, patchCurrentProfile, clearCurrentProfile } = profileSlice.actions;
export default profileSlice.reducer;
