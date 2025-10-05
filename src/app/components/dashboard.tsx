'use client';

import { useMemo, useState } from 'react';
import { useUser, useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, limit, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Video, Images, Sparkles, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('feed');

  const videosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), limit(12));
  }, [firestore, user]);

  const horoscopeRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/horoscopes/daily`);
  }, [firestore, user]);

  const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);
  const { data: horoscope, isLoading: horoscopeLoading } = useDoc(horoscopeRef);

  const images = [
    { id: 1, title: 'Mystic Forest', src: 'https://picsum.photos/seed/mystic/600/400', hint: 'forest' },
    { id: 2, title: 'Celestial Sky', src: 'https://picsum.photos/seed/celestial/600/400', hint: 'sky' },
    { id: 3, title: 'Spiritual Altar', src: 'https://picsum.photos/seed/altar/600/400', hint: 'spiritual' },
    { id: 4, title: 'Soothing Waterfall', src: 'https://picsum.photos/seed/waterfall/600/400', hint: 'waterfall' },
    { id: 5, title: 'Zen Garden', src: 'https://picsum.photos/seed/zen/600/400', hint: 'zen' },
    { id: 6, title: 'Sunlit Meadow', src: 'https://picsum.photos/seed/meadow/600/400', hint: 'meadow' },
  ];

  const isLoading = videosLoading || horoscopeLoading;

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Daily Feed
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Your curated spiritual and wellness content.
            </p>
          </div>
           <Button asChild>
              <Link href="/upload"><Upload className="mr-2"/>Upload Video</Link>
            </Button>
        </div>

        <Tabs defaultValue="feed" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-8">
            <TabsTrigger value="feed"><Video className="mr-2"/>Videos</TabsTrigger>
            <TabsTrigger value="images"><Images className="mr-2"/>Images</TabsTrigger>
            <TabsTrigger value="horoscope"><Sparkles className="mr-2"/>Horoscope</TabsTrigger>
          </TabsList>

          {isLoading && (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && (
            <>
              <TabsContent value="feed">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos && videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden group">
                      <CardContent className="p-0">
                         <Link href="#">
                            <div className="aspect-video bg-muted rounded-t-md overflow-hidden">
                              {video.thumbnailUrl && (
                                <Image 
                                  src={video.thumbnailUrl} 
                                  alt={video.title} 
                                  width={600} 
                                  height={400} 
                                  className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                                />
                              )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
                                <p className="text-muted-foreground text-sm mt-1">Aura Creator</p>
                                <p className="text-muted-foreground text-sm">1.2k views &middot; 2 days ago</p>
                            </div>
                         </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {(!videos || videos.length === 0) && <p className="text-muted-foreground text-center py-16">No videos uploaded yet. Be the first!</p>}
              </TabsContent>

              <TabsContent value="images">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((image) => (
                    <Card key={image.id} className="overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <Image 
                              src={image.src}
                              alt={image.title}
                              data-ai-hint={image.hint}
                              width={600}
                              height={400}
                              className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="horoscope">
                {horoscope ? (
                  <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-3xl">
                        <Sparkles className="text-accent h-8 w-8"/>
                        Today's Horoscope
                      </CardTitle>
                      <CardDescription>A personalized message for your zodiac sign: {horoscope.zodiacSign}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl leading-relaxed">{horoscope.text}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-muted-foreground text-center py-16">Your daily horoscope is not available yet.</p>
                )}
              </TabsContent>
            </>
          )}

        </Tabs>
    </div>
  );
}
