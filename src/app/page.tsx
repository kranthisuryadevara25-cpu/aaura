
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/app/components/header";
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Navigation } from "@/app/components/navigation";
import { RightSidebar } from '@/app/components/right-sidebar';
import { Feed } from '@/app/components/feed';

function LoggedInView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return undefined;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserDocLoading && userData && !userData.profileComplete) {
      router.push('/profile/setup');
    }
  }, [userData, isUserDocLoading, router]);

  if (isUserDocLoading || (userData && !userData.profileComplete)) {
     return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
     <SidebarProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar>
              <Navigation />
            </Sidebar>
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto]">
              <div className="py-6 px-4 sm:px-6 lg:px-8">
                 <div className="max-w-2xl mx-auto">
                    <Feed />
                 </div>
              </div>
              <RightSidebar />
            </main>
          </div>
        </div>
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
            Find Your aaura
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
        <p>&copy; {new Date().getFullYear()} aaura. All rights reserved.</p>
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
