'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, limit, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Video, Images, Sparkles, Upload } from 'lucide-react';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const videosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), limit(6));
  }, [firestore, user]);

  // Assuming horoscope is stored with an ID like 'daily'
  const horoscopeRef = useMemo(() => {
    if (!firestore || !user) return null;
    // For simplicity, we'll assume there is one daily horoscope document.
    // In a real app, you might query by date.
    return doc(firestore, `users/${user.uid}/horoscopes/daily`);
  }, [firestore, user]);

  const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);
  const { data: horoscope, isLoading: horoscopeLoading } = useDoc(horoscopeRef);

  const images = [
    { id: 1, title: 'Mystic Forest', src: 'https://picsum.photos/seed/mystic/600/400', hint: 'forest' },
    { id: 2, title: 'Celestial Sky', src: 'https://picsum.photos/seed/celestial/600/400', hint: 'sky' },
    { id: 3, title: 'Spiritual Altar', src: 'https://picsum.photos/seed/altar/600/400', hint: 'spiritual' },
  ];

  if (videosLoading || horoscopeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Your Daily Feed
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              A curated feed of spiritual content just for you.
            </p>
          </div>
          <Button asChild>
              <Link href="/upload"><Upload className="mr-2"/>Upload Video</Link>
            </Button>
        </div>

      {/* Horoscope Section */}
      {horoscope && (
        <Card className="mb-12 bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent"/>
              Today's Horoscope
            </CardTitle>
             <CardDescription>A personalized message for your zodiac sign: {horoscope.zodiacSign}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{horoscope.text}</p>
          </CardContent>
        </Card>
      )}

      {/* Videos Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2"><Video /> Latest Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos && videos.map((video) => (
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
        {(!videos || videos.length === 0) && <p className="text-muted-foreground">No videos uploaded yet. Be the first!</p>}
      </div>

      {/* Images Section */}
       <div>
        <h2 className="text-3xl font-headline font-bold mb-6 flex items-center gap-2"><Images /> Inspirational Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image 
                      src={image.src}
                      alt={image.title}
                      data-ai-hint={image.hint}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
