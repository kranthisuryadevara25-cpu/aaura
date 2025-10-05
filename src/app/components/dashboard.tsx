
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { Loader2, Youtube, Clapperboard, Sparkles } from 'lucide-react';
import { VideoCard } from './cards/video-card';
import { ShortCard } from './cards/short-card';
import { DeityCard } from './cards/deity-card';

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
            <div className="space-y-12">
                {/* Videos Section */}
                {videos && videos.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                           <Youtube className="text-primary" /> For You
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-x-4 gap-y-8">
                            {videos.map(video => <VideoCard key={video.id} video={video} />)}
                        </div>
                    </div>
                )}
               
                {/* Shorts Section */}
                {shorts && shorts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                            <Clapperboard className="text-primary" /> Shorts
                        </h2>
                        <div className="flex space-x-4 overflow-x-auto pb-4">
                           {shorts.map(short => <ShortCard key={short.id} short={short} />)}
                        </div>
                    </div>
                )}

                 {/* Deities Section */}
                {deities && deities.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                           <Sparkles className="text-primary" /> Discover Deities
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {deities.map(deity => <DeityCard key={deity.id} deity={deity} />)}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
