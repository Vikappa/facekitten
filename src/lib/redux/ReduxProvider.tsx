'use client';

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { hydrateHomepagePostsState } from "./homepagePostsSlice";
import { hydrateProfileState } from "./profileSlice";
import {
    loadPersistedHomepagePostsState,
    loadPersistedProfileState,
    makeStore,
    type AppStore,
} from "./store";

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
        if (persistedProfileState) {
            storeRef.current.dispatch(hydrateProfileState(persistedProfileState));
        }

        const persistedHomepagePostsState = loadPersistedHomepagePostsState();
        if (persistedHomepagePostsState) {
            storeRef.current.dispatch(hydrateHomepagePostsState(persistedHomepagePostsState));
        }
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
