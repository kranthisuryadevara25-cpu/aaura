
'use client';

import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase/client-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "./components/bottom-navigation"
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { LanguageProvider } from "@/hooks/use-language.tsx";


// This metadata is now static and won't be dynamically translated on the server.
// For fully dynamic metadata, you'd use the `generateMetadata` function.
// export const metadata: Metadata = {
//   title: "aaura",
//   description: "Your daily dose of spiritual wellness.",
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <body className="font-body antialiased">
        <I18nextProvider i18n={i18n}>
          <FirebaseClientProvider>
            <LanguageProvider>
              <SidebarProvider>
                <div className="pb-16 md:pb-0">
                  {children}
                </div>
                <BottomNavigation />
              </SidebarProvider>
            </LanguageProvider>
          </FirebaseClientProvider>
        </I18nextProvider>
        <Toaster />
      </body>
    </html>
  )
}
