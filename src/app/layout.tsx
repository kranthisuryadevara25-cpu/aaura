import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/hooks/use-language";
import { FirebaseProvider } from "@/lib/firebase/provider";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Playfair_Display, PT_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const fontHeadline = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
});

const fontBody = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "Aaura",
  description: "Your daily dose of spiritual wellness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.FIREBASE_APP_ID,
  };

  const hasFirebaseClientConfig = Boolean(
    firebaseClientConfig.apiKey && firebaseClientConfig.projectId
  );

  const firebaseConfigScript = hasFirebaseClientConfig
    ? `window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseClientConfig).replace(
        /</g,
        "\\u003c"
      )};`
    : undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        {firebaseConfigScript ? (
          <script
            id="firebase-config"
            dangerouslySetInnerHTML={{ __html: firebaseConfigScript }}
          />
        ) : null}
        <LanguageProvider>
          <FirebaseProvider>
            <div className="min-h-screen flex flex-col">
              <TopNav />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {children}
                  </div>
                </main>
                <aside className="hidden xl:block w-80 border-l p-4 shrink-0 overflow-y-auto">
                  <RightSidebar />
                </aside>
              </div>
            </div>
          </FirebaseProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
