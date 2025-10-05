
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { TempleCard } from './cards/temple-card';
import { StoryCard } from './cards/story-card';
import { DeityCard } from './cards/deity-card';
import { VideoCard } from './cards/video-card';

// Fisher-Yates shuffle algorithm
function shuffle(array: any[]) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function Feed() {
    const firestore = useFirestore();
    const [feedItems, setFeedItems] = useState<any[]>([]);
    
    const mediaQuery = useMemo(() => firestore ? query(collection(firestore, 'media'), limit(10)) : null, [firestore]);
    const { data: media, isLoading: mediaLoading } = useCollection(mediaQuery);

    const templesQuery = useMemo(() => firestore ? query(collection(firestore, 'temples'), limit(5)) : null, [firestore]);
    const { data: temples, isLoading: templesLoading } = useCollection(templesQuery);
    
    const storiesQuery = useMemo(() => firestore ? query(collection(firestore, 'stories'), limit(5)) : null, [firestore]);
    const { data: stories, isLoading: storiesLoading } = useCollection(storiesQuery);
    
    const deitiesQuery = useMemo(() => firestore ? query(collection(firestore, 'deities'), limit(5)) : null, [firestore]);
    const { data: deities, isLoading: deitiesLoading } = useCollection(deitiesQuery);

    const isLoading = mediaLoading || templesLoading || storiesLoading || deitiesLoading;
    
    useEffect(() => {
        if (!isLoading) {
            const allItems = [
                ...(media?.map(item => ({ ...item, type: 'video' })) || []),
                ...(temples?.map(item => ({ ...item, type: 'temple' })) || []),
                ...(stories?.map(item => ({ ...item, type: 'story' })) || []),
                ...(deities?.map(item => ({ ...item, type: 'deity' })) || []),
            ];
            setFeedItems(shuffle(allItems));
        }
    }, [media, temples, stories, deities, isLoading]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8">
            {feedItems.map((item) => {
                switch (item.type) {
                    case 'video':
                        return <VideoCard key={`video-${item.id}`} video={item} />;
                    case 'temple':
                        return <TempleCard key={`temple-${item.id}`} temple={item} />;
                    case 'story':
                        return <StoryCard key={`story-${item.id}`} story={item} />;
                    case 'deity':
                        return <DeityCard key={`deity-${item.id}`} deity={item} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
