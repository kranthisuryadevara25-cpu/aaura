'use client';

import { useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, limit, where, orderBy } from 'firebase/firestore';
import { Loader2, Youtube, Clapperboard, Sparkles } from 'lucide-react';
import { VideoCard } from '@/components/cards/video-card';
import { DeityCard } from '@/components/cards/deity-card';
import { useLanguage } from '@/hooks/use-language';
import { db } from '@/lib/firebase';
import { Deity } from '@/lib/deities';
import { ShortCard } from '@/components/cards/short-card';

export function Dashboard() {
    const { language } = useLanguage();

    const videosQuery = useMemo(() => {
        return query(
            collection(db, 'media'), 
            where('mediaType', 'in', ['video', 'pravachan']), 
            where('status', '==', 'approved'),
            orderBy('uploadDate', 'desc'),
            limit(8)
        )
    }, []);
    
    const shortsQuery = useMemo(() => {
        return query(
            collection(db, 'media'), 
            where('mediaType', '==', 'short'), 
            where('status', '==', 'approved'),
            orderBy('uploadDate', 'desc'),
            limit(6)
        );
    }, []);

    const deitiesQuery = useMemo(() => query(collection(db, 'deities'), limit(4)), []);
    
    const [videos, videosLoading] = useCollectionData(videosQuery, { idField: 'id' });
    const [shorts, shortsLoading] = useCollectionData(shortsQuery, { idField: 'id' });
    const [deities, deitiesLoading] = useCollectionData(deitiesQuery, { idField: 'id' });

    const isLoading = videosLoading || shortsLoading || deitiesLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-12">
                {/* Videos Section - Single Column Feed */}
                {videos && videos.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                           <Youtube className="text-primary" /> For You
                        </h2>
                        <div className="grid grid-cols-1 gap-y-8">
                            {videos.map(video => <VideoCard key={video.id} video={video} />)}
                        </div>
                    </div>
                )}
               
                {/* Shorts Section - Remains horizontal scroll */}
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

                 {/* Deities Section - Horizontal Cards */}
                {deities && deities.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                           <Sparkles className="text-primary" /> Discover Deities
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {deities.map(deity => <DeityCard key={deity.id} deity={deity as Deity & {id: string}} />)}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
