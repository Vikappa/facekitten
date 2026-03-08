import { configureStore } from "@reduxjs/toolkit";
import profileReducer, {
    initialProfileState,
    type ProfileState,
    type UserProfile,
} from "./profileSlice";
import uiReducer from "./uiSlice";

const PROFILE_STORAGE_KEY = "fk_profile_state";

function isUserProfile(value: unknown): value is UserProfile {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const profile = value as Record<string, unknown>;
    return (
        typeof profile.id === "string" &&
        typeof profile.email === "string" &&
        typeof profile.username === "string" &&
        typeof profile.avatarUrl === "string" &&
        typeof profile.bannerUrl === "string" &&
        typeof profile.bio === "string" &&
        typeof profile.confirmedAccount === "boolean"
    );
}

function loadPersistedProfileState(): ProfileState | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    const serializedState = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!serializedState) {
        return undefined;
    }

    try {
        const parsedState = JSON.parse(serializedState) as Partial<ProfileState>;

        if (parsedState.currentProfile === null) {
            return initialProfileState;
        }

        if (isUserProfile(parsedState.currentProfile)) {
            return { currentProfile: parsedState.currentProfile };
        }
    } catch {
        return undefined;
    }

    return undefined;
}

function savePersistedProfileState(profileState: ProfileState) {
    if (typeof window === "undefined") {
        return;
    }

    if (!profileState.currentProfile) {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
        return;
    }

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileState));
}

export const makeStore = () => {
    const store = configureStore({
        reducer: {
            ui: uiReducer,
            profile: profileReducer,
        },
    });

    let previousProfile = store.getState().profile.currentProfile;

    store.subscribe(() => {
        const currentProfile = store.getState().profile.currentProfile;
        if (currentProfile === previousProfile) {
            return;
        }

        previousProfile = currentProfile;
        savePersistedProfileState(store.getState().profile);
    });

    return store;
};

export { loadPersistedProfileState };

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
