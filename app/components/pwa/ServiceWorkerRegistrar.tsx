"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes Chrome offer to install the app.
 *
 * Production only: in development a worker sitting in front of the dev server
 * only gets in the way of hot reloading.
 */
export function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        if (!("serviceWorker" in navigator)) return;

        const register = () => {
            navigator.serviceWorker.register("/sw.js").catch((error) => {
                // Registration failing costs the install prompt, nothing else.
                console.error("Service worker registration failed", error);
            });
        };

        // After load, so registering never competes with the first paint.
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register, { once: true });

        return () => window.removeEventListener("load", register);
    }, []);

    return null;
}
