"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { LanguageProvider } from "@/hooks/use-language";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>aaura</title>
        <meta name="description" content="Your daily dose of spiritual wellness." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Laila:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <I18nextProvider i18n={i18n}>
            {/* Firebase wrapper for Firestore, Auth, Storage */}
            <FirebaseClientProvider>
            {/* Language wrapper for multi-language UI & input */}
            <LanguageProvider>
                {children}
            </LanguageProvider>
            </FirebaseClientProvider>
        </I18nextProvider>
        <Toaster />
      </body>
    </html>
  );
}
