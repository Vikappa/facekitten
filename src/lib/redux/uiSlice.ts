import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type NavFunction = "squares" | "messenger" | "bell" | "profile";
export type MidNavbarTab = "home" | "marketplace" | "groups" | "videogames";

interface UiState {
    activeNavFunction: NavFunction | null;
    activeMidNavbarTab: MidNavbarTab | null;
    isSmallSearchBarVisible: boolean;
    searchTerm: string;
}

const initialState: UiState = {
    activeNavFunction: null,
    activeMidNavbarTab: null,
    isSmallSearchBarVisible: false,
    searchTerm: "",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setActiveNavFunction(state, action: PayloadAction<NavFunction | null>) {
            state.activeNavFunction = action.payload;
        },
        toggleNavFunction(state, action: PayloadAction<NavFunction>) {
            state.activeNavFunction = state.activeNavFunction === action.payload ? null : action.payload;
        },
        setActiveMidNavbarTab(state, action: PayloadAction<MidNavbarTab | null>) {
            state.activeMidNavbarTab = action.payload;
        },
        toggleMidNavbarTab(state, action: PayloadAction<MidNavbarTab>) {
            state.activeMidNavbarTab = state.activeMidNavbarTab === action.payload ? null : action.payload;
        },
        setSmallSearchBarVisible(state, action: PayloadAction<boolean>) {
            state.isSmallSearchBarVisible = action.payload;
        },
        toggleSmallSearchBarVisible(state) {
            state.isSmallSearchBarVisible = !state.isSmallSearchBarVisible;
        },
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        resetNavbarUiState(state) {
            state.activeNavFunction = null;
            state.activeMidNavbarTab = null;
            state.isSmallSearchBarVisible = false;
            state.searchTerm = "";
        },
    },
});

export const {
    setActiveNavFunction,
    toggleNavFunction,
    setActiveMidNavbarTab,
    toggleMidNavbarTab,
    setSmallSearchBarVisible,
    toggleSmallSearchBarVisible,
    setSearchTerm,
    resetNavbarUiState,
} = uiSlice.actions;

export default uiSlice.reducer;
