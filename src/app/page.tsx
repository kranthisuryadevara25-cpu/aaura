'use client';

import { Header } from "@/app/components/header";
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Dashboard } from "@/app/components/dashboard";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Navigation } from "@/app/components/navigation";

export default function Home() {
  const { user, isUserLoading } = useUser();

  const isLoading = isUserLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                Welcome to Aura
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Your daily dose of spiritual wellness. Explore videos, get personalized horoscopes, and more.
              </p>
              <Button asChild className="mt-6">
                <Link href="/login">Login to Get Started</Link>
              </Button>
            </div>
        </main>
        <footer className="text-center p-6 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
            <Dashboard />
          </main>
          <footer className="text-center p-6 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
