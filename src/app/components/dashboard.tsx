
'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, limit, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Video, Sparkles, Upload, ArrowRight, Film } from 'lucide-react';
import { deities } from '@/lib/deities';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const videosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('isShortForm', '!=', true), limit(8));
  }, [firestore, user]);
  
  const shortsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('isShortForm', '==', true), limit(6));
  }, [firestore, user]);

  const horoscopeRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/horoscopes/daily`);
  }, [firestore, user]);

  const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);
  const { data: shorts, isLoading: shortsLoading } = useCollection(shortsQuery);
  const { data: horoscope, isLoading: horoscopeLoading } = useDoc(horoscopeRef);

  const { data: placeholderVideoThumbs } = useCollection(
    useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'videos'), where('isShortForm', '!=', true));
    }, [firestore])
  );

  const { data: placeholderShortThumbs } = useCollection(
      useMemo(() => {
          if (!firestore) return null;
          return query(collection(firestore, 'videos'), where('isShortForm', '==', true));
      }, [firestore])
  );

  const isLoading = videosLoading || horoscopeLoading || shortsLoading;

  const getImageForId = (id: string, isShort: boolean) => {
    const collection = isShort ? placeholderShortThumbs : placeholderVideoThumbs;
    const images = placeholderImages.filter(p => p.id.startsWith(isShort ? 'short' : 'video'));
    if (!collection) return images[0].imageUrl;
    const index = collection.findIndex(item => item.id === id);
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
      
      {/* Daily Horoscope Section */}
      {horoscope && (
         <Card className="w-full bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4">
              <Sparkles className="text-accent h-10 w-10 shrink-0"/>
              <div>
                <CardTitle className="text-2xl md:text-3xl text-primary">Your Daily Horoscope</CardTitle>
                <CardDescription>A celestial message for {horoscope.zodiacSign}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90">{horoscope.text}</p>
            </CardContent>
          </Card>
      )}

      {/* Shorts Section */}
       {shorts && shorts.length > 0 && (
        <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold flex items-center gap-3"><Film /> Shorts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {shorts.map((short) => (
                    <Link href="#" key={short.id} className="group">
                        <Card className="overflow-hidden aspect-[9/16] relative rounded-xl">
                            <Image 
                                src={getImageForId(short.id, true)}
                                alt={short.title}
                                fill
                                className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-3">
                                <h3 className="font-semibold text-white text-sm line-clamp-2">{short.title}</h3>
                                <p className="text-white/80 text-xs">{short.views} views</p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
             <Separator />
        </div>
        
      )}

      {/* Main Video Feed */}
      <div className="space-y-4">
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3"><Sparkles className="text-accent" /> For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {videos && videos.length > 0 ? videos.map((video) => (
            <div key={video.id} className="group">
              <Link href="#">
                <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-3 relative">
                  <Image 
                    src={getImageForId(video.id, false)} 
                    alt={video.title}
                    fill
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                  />
                   <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">12:34</div>
                </div>
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 mt-0.5">
                      <AvatarImage src={'https://picsum.photos/seed/creator-avatar/40/40'} />
                      <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2">{video.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">aaura Creator</p>
                    <p className="text-muted-foreground text-sm">{video.views} views &middot; {new Date(video.uploadDate?.toDate()).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            </div>
          )) : <p className="text-muted-foreground col-span-full">No videos in your feed yet. Upload one to get started!</p>}
        </div>
         <Separator className="mt-8"/>
      </div>

      {/* Discover Deities Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-headline font-bold">Discover Deities</h2>
            <Button variant="ghost" asChild>
                <Link href="/deities">
                    View All <ArrowRight className="ml-2"/>
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deities.slice(0, 3).map((deity) => (
                <Card key={deity.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300 rounded-xl">
                    <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={deity.images[0].url}
                                alt={deity.name}
                                data-ai-hint={deity.images[0].hint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-primary">{deity.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{deity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/deities/${deity.slug}`}>
                                Explore <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

    </div>
  );
}
