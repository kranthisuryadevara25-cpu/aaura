'use client';

import { useMemo } from 'react';
import { Header } from "@/app/components/header";
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const videosQuery = useMemo(() => {
    // Only create the query if the user is logged in and firestore is available.
    if (!firestore || !user) return null;
    return collection(firestore, 'videos');
  }, [firestore, user]);

  const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);

  const isLoading = isUserLoading || (user && videosLoading);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Shared Videos
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Explore a collection of spiritual and mythological videos.
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/upload">Upload Video</Link>
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !user && (
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Please log in to view and upload videos.</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
        
        {!isLoading && user && videos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    {video.thumbnailUrl && (
                      <Image 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        width={600} 
                        height={400} 
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-3">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
      <footer className="text-center p-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
      </footer>
    </div>
  );
}
