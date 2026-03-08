'use client';

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { setCurrentProfile } from "./profileSlice";
import { loadPersistedProfileState, makeStore, type AppStore } from "./store";

interface ReduxProviderProps {
    children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    const storeRef = useRef<AppStore | null>(null);
    const hasHydratedPersistedStateRef = useRef(false);

    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        if (hasHydratedPersistedStateRef.current || !storeRef.current) {
            return;
        }

        hasHydratedPersistedStateRef.current = true;

        const persistedProfileState = loadPersistedProfileState();
        const persistedProfile = persistedProfileState?.currentProfile;

        if (persistedProfile) {
            storeRef.current.dispatch(setCurrentProfile(persistedProfile));
        }
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
