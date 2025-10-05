
'use client';

import { Header } from "@/app/components/header";
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Dashboard } from "@/app/components/dashboard";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Navigation } from "./navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function LoggedInView() {
  return (
     <SidebarProvider>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
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

function LoggedOutView() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-primary">
            Find Your Aura
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Your daily sanctuary for spiritual wellness. Explore videos, get personalized horoscopes, and connect with your inner self.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/login">Join the Community</Link>
          </Button>
        </div>
      </main>
      <footer className="text-center p-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
      </footer>
    </div>
  );
}


export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return user ? <LoggedInView /> : <LoggedOutView />;
}

    