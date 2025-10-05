'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, limit, query, where, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Film, Star } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { deities } from '@/lib/deities';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const shortsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('isShortForm', '==', true), limit(6));
  }, [firestore, user]);

  const videosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('isShortForm', '!=', true), limit(8));
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
          return query(collection(firestore, 'videos'), where('isShortForm', '==', true));
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

  const randomDeities = useMemo(() => deities.sort(() => 0.5 - Math.random()).slice(0, 4), []);


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

       {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
            {/* Shorts Shelf */}
            {shorts && shorts.length > 0 && (
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-headline font-bold flex items-center gap-3"><Film /> Shorts</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {shorts.map((short) => (
                        <Link href="#" key={short.id} className="group">
                            <Card className="overflow-hidden aspect-[9/16] relative rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                                <Image
                                    src={getShortImageForId(short.id)}
                                    alt={short.title}
                                    fill
                                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="font-semibold text-white text-md line-clamp-2">{short.title}</h3>
                                </div>
                            </Card>
                        </Link>
                        ))}
                    </div>
                </div>
            )}


            {/* Long-form Videos Grid */}
            {videos && videos.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-headline font-bold">Featured Videos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map(video => (
                            <Link href="#" key={video.id} className="group">
                                <Card className="overflow-hidden border-0 bg-transparent shadow-none rounded-none">
                                    <CardContent className="p-0 mb-3">
                                        <div className="aspect-video relative rounded-xl overflow-hidden">
                                            <Image
                                                src={getVideoImageForId(video.id)}
                                                alt={video.title}
                                                fill
                                                className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardHeader className="p-0">
                                        <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground">{video.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            aaura Creator &bull; {video.views} views
                                        </p>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-8">
            {horoscope && (
              <Card className="bg-transparent border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><Star className="h-5 w-5"/> Daily Horoscope</CardTitle>
                  <Badge variant="secondary" className="w-fit">{horoscope.zodiacSign}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90">{horoscope.text}</p>
                </CardContent>
              </Card>
            )}

             <div className="space-y-4">
                <h3 className="text-xl font-headline font-bold">Discover Deities</h3>
                <div className="space-y-3">
                    {randomDeities.map(deity => (
                         <Link href={`/deities/${deity.slug}`} key={deity.id} className="group flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                                <Image src={deity.images[0].url} alt={deity.name} data-ai-hint={deity.images[0].hint} fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm group-hover:text-primary">{deity.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{deity.description}</p>
                            </div>
                         </Link>
                    ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
