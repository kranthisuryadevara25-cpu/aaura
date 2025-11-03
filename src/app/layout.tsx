
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
  title: "Aura",
  description: "Your daily dose of spiritual wellness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased bg-background text-foreground",
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <LanguageProvider>
          <FirebaseProvider>
            <div className="min-h-screen flex flex-col">
              <TopNav />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
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
