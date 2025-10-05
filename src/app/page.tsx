'use client';

import { Header } from "@/app/components/header";
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Dashboard } from "@/app/components/dashboard";

export default function Home() {
  const { user, isUserLoading } = useUser();

  const isLoading = isUserLoading;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !user && (
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
        )}
        
        {!isLoading && user && <Dashboard />}

      </main>
      <footer className="text-center p-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
      </footer>
    </div>
  );
}
