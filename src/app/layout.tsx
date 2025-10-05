"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/hooks/use-language";
import { TopNav } from "@/components/TopNav";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Navigation } from "@/app/components/navigation";
import { RightSidebar } from "./components/right-sidebar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { BottomNavigation } from "./components/bottom-navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user] = useAuthState(auth);

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
            <SidebarProvider>
                <div className="min-h-screen bg-background text-foreground flex flex-col">
                  <TopNav />
                  <div className="flex flex-1">
                    {user && 
                      <Sidebar>
                        <Navigation />
                      </Sidebar>
                    }
                    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
                        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                            {children}
                        </div>
                        {user && 
                          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 border-l">
                              <RightSidebar />
                          </div>
                        }
                    </main>
                  </div>
                  <BottomNavigation />
                </div>
            </SidebarProvider>
          </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
