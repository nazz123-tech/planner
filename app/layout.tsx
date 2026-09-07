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
                            <Toaster />
                            <div>{children}</div>
                        </LanguageProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

