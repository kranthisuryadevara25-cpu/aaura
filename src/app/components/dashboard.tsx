'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, limit, query, where, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Film, Star, Music, Mic } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { deities } from '@/lib/deities';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const shortsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'media'), where('mediaType', '==', 'short'), limit(20));
  }, [firestore, user]);

  const videosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'media'), where('mediaType', '==', 'video'), limit(8));
  }, [firestore, user]);

  const dailyHoroscopeRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/horoscopes/daily`);
  }, [firestore, user]);

  const { data: shorts, isLoading: shortsLoading } = useCollection(shortsQuery);
  const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);
  const { data: horoscope, isLoading: horoscopeLoading } = useDoc(dailyHoroscopeRef);


  const { data: placeholderShortThumbs } = useCollection(
      useMemo(() => {
          if (!firestore) return null;
          return query(collection(firestore, 'media'), where('mediaType', '==', 'short'));
      }, [firestore])
  );

  const isLoading = shortsLoading || videosLoading || horoscopeLoading;

  const getShortImageForId = (id: string) => {
    const images = placeholderImages.filter(p => p.id.startsWith('short'));
    if (!placeholderShortThumbs) return images[0].imageUrl;
    const index = placeholderShortThumbs.findIndex(item => item.id === id);
    return images[index % images.length].imageUrl;
  }

  const getVideoImageForId = (id: string) => {
      const images = placeholderImages.filter(p => p.id.startsWith('video'));
      if (!videos) return images[0].imageUrl;
      const index = videos.findIndex(item => item.id === id);
      return images[index % images.length].imageUrl;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
            Welcome, {user?.displayName || 'Seeker'}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Your daily sanctuary for spiritual discovery.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2" />
            Upload Media
          </Link>
        </Button>
      </div>

       {/* Main content: Shorts Feed */}
      {shorts && shorts.length > 0 ? (
        <div className="flex flex-col items-center space-y-8">
            {shorts.map((short) => (
            <Card key={short.id} className="w-full max-w-sm overflow-hidden aspect-[9/16] relative rounded-xl shadow-lg group">
                <Image
                    src={getShortImageForId(short.id)}
                    alt={short.title}
                    fill
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="font-semibold text-white text-lg line-clamp-2">{short.title}</h3>
                    <p className="text-sm text-white/80">aaura Creator</p>
                </div>
            </Card>
            ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <Film className="mx-auto h-24 w-24 text-muted-foreground/50" />
            <h2 className="mt-6 text-2xl font-semibold text-foreground">No Shorts Yet</h2>
            <p className="mt-2 text-muted-foreground">Be the first to upload a short video!</p>
        </div>
      )}
    </div>
  );
}
