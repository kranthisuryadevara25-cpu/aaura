
'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, limit, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Film } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const shortsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('isShortForm', '==', true), limit(20));
  }, [firestore, user]);

  const { data: shorts, isLoading: shortsLoading } = useCollection(shortsQuery);

  const { data: placeholderShortThumbs } = useCollection(
      useMemo(() => {
          if (!firestore) return null;
          return query(collection(firestore, 'videos'), where('isShortForm', '==', true));
      }, [firestore])
  );

  const isLoading = shortsLoading;

  const getImageForId = (id: string) => {
    const images = placeholderImages.filter(p => p.id.startsWith('short'));
    if (!placeholderShortThumbs) return images[0].imageUrl;
    const index = placeholderShortThumbs.findIndex(item => item.id === id);
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
            Welcome, {user?.displayName || 'Seeker'}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Your daily spiritual journey starts here.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2" />
            Upload Video
          </Link>
        </Button>
      </div>
      
      {/* Reels-like Shorts Feed */}
       {shorts && shorts.length > 0 && (
        <div className="flex flex-col items-center space-y-8">
            <h2 className="text-3xl font-headline font-bold flex items-center gap-3 self-start"><Film /> Shorts Feed</h2>
            <div className="w-full max-w-sm space-y-8">
                {shorts.map((short) => (
                    <Link href="#" key={short.id} className="group">
                        <Card className="overflow-hidden aspect-[9/16] relative rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                            <Image 
                                src={getImageForId(short.id)}
                                alt={short.title}
                                fill
                                className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-4">
                                <h3 className="font-semibold text-white text-md line-clamp-2">{short.title}</h3>
                                <p className="text-white/80 text-sm mt-1">aaura Creator</p>
                                <p className="text-white/80 text-sm">{short.views} views</p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}
