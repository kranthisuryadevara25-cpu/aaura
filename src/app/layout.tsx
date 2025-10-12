
// This is a minimal root layout.
// The main page layout is now in src/app/page.tsx.

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/hooks/use-language";
import { FirebaseProvider } from "@/lib/firebase/provider";

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
          <LanguageProvider>
            <FirebaseProvider>
                {children}
            </FirebaseProvider>
          </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
