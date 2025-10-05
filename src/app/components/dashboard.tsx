
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { VideoCard } from './cards/video-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortCard } from './cards/short-card';
import { DeityCard } from './cards/deity-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export function Dashboard() {
    const firestore = useFirestore();
    const { user } = useUser();

    const videosQuery = useMemo(() => firestore ? query(collection(firestore, 'media'), where('mediaType', 'in', ['video', 'pravachan']), limit(8)) : null, [firestore]);
    const shortsQuery = useMemo(() => firestore ? query(collection(firestore, 'media'), where('mediaType', '==', 'short'), limit(6)) : null, [firestore]);
    const deitiesQuery = useMemo(() => firestore ? query(collection(firestore, 'deities'), limit(4)) : null, [firestore]);
    
    const { data: videos, isLoading: videosLoading } = useCollection(videosQuery);
    const { data: shorts, isLoading: shortsLoading } = useCollection(shortsQuery);
    const { data: deities, isLoading: deitiesLoading } = useCollection(deitiesQuery);
    
    const isLoading = videosLoading || shortsLoading || deitiesLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Welcome back, {user?.displayName?.split(' ')[0] || 'Seeker'}!</h2>
                    <p className="text-muted-foreground">Here's your spiritual feed for {format(new Date(), 'MMMM do, yyyy')}</p>
                </div>
                
                {shorts && shorts.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Shorts</h3>
                        <div className="relative">
                            <ScrollArea>
                                <div className="flex space-x-4 pb-4">
                                    {shorts.map((short) => (
                                        <ShortCard key={short.id} short={short} />
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    </section>
                )}

                <Separator className="mb-12" />

                {videos && videos.length > 0 && (
                     <section className="mb-12">
                        <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Recommended For You</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                            {videos.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    </section>
                )}
                
                {deities && deities.length > 0 && (
                    <section>
                         <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Discover Deities</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {deities.map(deity => (
                                <DeityCard deity={deity} key={deity.id} />
                            ))}
                         </div>
                    </section>
                )}
            </div>
        </main>
    );
}

