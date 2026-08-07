import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "./components/context/AuthContext";
import { QueryProvider } from "./components/providers/QueryProvider";
import { Fredoka, Space_Mono } from "next/font/google";

const fredoka = Fredoka({
    variable: "--font-fredoka",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    display: "swap",
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "700"],
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
        <html lang="en" className={`${fredoka.variable} ${spaceMono.variable}`}>
            <body>
                <QueryProvider>
                    <AuthProvider>
                        <div>{children}</div>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
