import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "./components/context/AuthContext";
import { QueryProvider } from "./components/providers/QueryProvider";
import { Space_Mono, Source_Serif_4, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const source = Source_Serif_4({
    variable: "--font-source",
    subsets: ["latin"],
    display: "swap",
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
});
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});
export const metadata: Metadata = {
    title: "Planly",
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
            className={`${source.variable} ${inter.variable} ${spaceMono.variable}`}
        >
            <body>
                <QueryProvider>
                    <AuthProvider>
                        <Toaster />
                        <div>{children}</div>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

