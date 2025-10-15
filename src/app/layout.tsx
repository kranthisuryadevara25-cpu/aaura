
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/hooks/use-language";
import { FirebaseProvider } from "@/lib/firebase/provider";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";

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
                <div className="min-h-screen bg-background text-foreground">
                  <TopNav />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 lg:p-6">
                      {children}
                    </main>
                    <aside className="hidden xl:block w-80 border-l p-4 shrink-0">
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
