import { configureStore } from "@reduxjs/toolkit";
import profileReducer, {
    initialProfileState,
    type ProfileState,
    type UserProfile,
} from "./profileSlice";
import uiReducer from "./uiSlice";

const PROFILE_STORAGE_KEY = "fk_profile_state";
const LETTINO_OPTIONS = new Set<NonNullable<UserProfile["tipoCuccia"]>>([
    "Cuccia",
    "Scatola",
    "Cassetto dei calzini (scassinato)",
    "Strada",
    "Letto di umano (ospite)",
    "Letto di umano (espropriato)",
    "Divano",
    "Sedia",
    "Poltrona",
]);

function isLettino(value: unknown): value is NonNullable<UserProfile["tipoCuccia"]> {
    return typeof value === "string" && LETTINO_OPTIONS.has(value as NonNullable<UserProfile["tipoCuccia"]>);
}

function normalizeUserProfile(value: unknown): UserProfile | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const profile = value as Record<string, unknown>;
    const { id, email, username, avatarUrl, bannerUrl, bio, confirmedAccount } = profile;
    if (
        typeof id !== "string" ||
        typeof email !== "string" ||
        typeof username !== "string" ||
        typeof avatarUrl !== "string" ||
        typeof bannerUrl !== "string" ||
        typeof bio !== "string" ||
        typeof confirmedAccount !== "boolean"
    ) {
        return null;
    }

    const tipoCucciaRaw = profile.tipoCuccia;
    const tipoCuccia =
        tipoCucciaRaw === null || isLettino(tipoCucciaRaw)
            ? tipoCucciaRaw
            : null;

    return {
        id,
        email,
        username,
        avatarUrl,
        bannerUrl,
        bio,
        confirmedAccount,
        dataDiNascita:
            typeof profile.dataDiNascita === "string" || profile.dataDiNascita === null
                ? profile.dataDiNascita
                : null,
        giocattoloPreferito:
            typeof profile.giocattoloPreferito === "string" ? profile.giocattoloPreferito : "",
        location: typeof profile.location === "string" ? profile.location : "",
        tipoCuccia,
    };
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

        const normalizedProfile = normalizeUserProfile(parsedState.currentProfile);
        if (normalizedProfile) {
            return { currentProfile: normalizedProfile };
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
