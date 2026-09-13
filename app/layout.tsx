import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AuthProvider } from "./components/context/AuthContext";
import { QueryProvider } from "./components/providers/QueryProvider";
import {
    Space_Mono,
    Source_Serif_4,
    Inter,
    IBM_Plex_Mono,
} from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { ServiceWorkerRegistrar } from "./components/pwa/ServiceWorkerRegistrar";

const source = Source_Serif_4({
    variable: "--font-source",
    // "cyrillic" for Ukrainian — without it Cyrillic text falls back to a
    // system font and the page changes typeface mid-sentence.
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    // Space Mono has no Cyrillic — latin, latin-ext and vietnamese only.
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
});

/**
 * Carries Cyrillic for --font-main. IBM Plex Mono is the closest Cyrillic
 * monospace on Google Fonts to Space Mono's slab-terminalled, engineered
 * look, and IBM drew its Cyrillic to harmonise with the Latin.
 */
const plexMono = IBM_Plex_Mono({
    variable: "--font-mono-cyrillic",
    subsets: ["latin", "cyrillic"],
    weight: ["400", "700"],
    display: "swap",
});
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});
// Without this, mobile browsers lay out at ~980px and zoom the page out.
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#E4D6B4",
};

export const metadata: Metadata = {
    title: {
        default: "Planly",
        template: "%s · Planly",
    },
    description: "Plan in own way",
    applicationName: "Planly",
    manifest: "/manifest.webmanifest",

    /**
     * iOS doesn't read display/name/icons from the manifest for Add to Home
     * Screen — it still wants these meta tags. `capable` is what makes the
     * launched app drop Safari's chrome; without it the icon just opens a
     * normal browser tab.
     */
    appleWebApp: {
        capable: true,
        title: "Planly",
        // The page is cream, so the light bar with dark text matches it.
        statusBarStyle: "default",
    },

    /**
     * Next 16 emits the standardised `mobile-web-app-capable`, which only
     * Safari 17.4+ honours. iOS before that reads the apple-prefixed name,
     * and without it the home-screen icon opens an ordinary Safari tab
     * instead of a chrome-less window.
     */
    other: {
        "apple-mobile-web-app-capable": "yes",
    },

    icons: {
        icon: [
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
            { url: "/icon.svg", type: "image/svg+xml" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${source.variable} ${inter.variable} ${spaceMono.variable} ${plexMono.variable}`}
        >
            <body>
                <QueryProvider>
                    <AuthProvider>
                        <LanguageProvider>
                            <ServiceWorkerRegistrar />
                            <Toaster />
                            <div>{children}</div>
                        </LanguageProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

