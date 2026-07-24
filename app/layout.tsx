import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "./components/guard/AuthGuard";
import { AuthProvider } from "./components/context/AuthContex";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PLANer",
  description: "Plan in own way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthGuard>
          <AuthProvider>{children}</AuthProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
