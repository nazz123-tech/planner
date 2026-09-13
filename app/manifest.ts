import type { MetadataRoute } from "next";

/**
 * Served at /manifest.webmanifest by Next's file convention.
 *
 * This is what lets Planly be added to the macOS Dock from Safari, or to the
 * iPhone home screen, and open in its own window with no browser chrome.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        // `id` pins the app's identity: without it the identity is derived
        // from start_url, and changing that later would register as a
        // different app rather than an update.
        id: "/",
        name: "Planly",
        short_name: "Planly",
        description: "Plan in own way",

        // "/" redirects to the dashboard when signed in and to login when
        // not, so the launcher lands correctly either way.
        start_url: "/",
        scope: "/",

        // No browser chrome — the point of installing it.
        display: "standalone",
        // Deliberately no `orientation`: locking portrait would be wrong for
        // a window in the Dock.

        // background_color paints the launch screen before the app renders,
        // so it matches the page rather than flashing white.
        background_color: "#E4D6B4",
        theme_color: "#E4D6B4",

        lang: "en",
        dir: "ltr",
        categories: ["productivity"],

        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                // Android crops to roughly the central 80%, so this one has
                // the mark shrunk to survive the mask.
                src: "/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
