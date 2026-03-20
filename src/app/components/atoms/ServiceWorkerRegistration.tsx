"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            return;
        }

        if (!("serviceWorker" in navigator)) {
            return;
        }

        if (!window.isSecureContext && window.location.hostname !== "localhost") {
            return;
        }

        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });

                await registration.update();
            } catch (error) {
                console.error("Service worker registration failed:", error);
            }
        };

        void registerServiceWorker();
    }, []);

    return null;
}
