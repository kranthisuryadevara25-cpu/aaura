
'use client';

import { useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { TempleCard } from './cards/temple-card';
import { StoryCard } from './cards/story-card';
import { DeityCard } from './cards/deity-card';
import { VideoCard } from './cards/video-card';
import { temples } from '@/lib/temples';
import { stories } from '@/lib/stories';
import { deities } from '@/lib/deities';
import { db } from '@/lib/firebase';
import { Deity } from '@/lib/deities';

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
    const mediaQuery = useMemo(() => query(collection(db, 'media'), limit(10)), []);
    const [media, mediaLoading] = useCollectionData(mediaQuery, { idField: 'id' });

    const feedItems = useMemo(() => {
        if (mediaLoading) return [];
        const allItems = [
            ...(media?.map(item => ({ ...item, type: 'video' })) || []),
            ...(temples.map(item => ({ ...item, type: 'temple' })) || []),
            ...(stories.map(item => ({ ...item, type: 'story' })) || []),
            ...(deities.map(item => ({ ...item, type: 'deity' })) || []),
        ];
        return shuffle(allItems);
    }, [media, mediaLoading]);

    if (mediaLoading) {
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
                        return <DeityCard key={`deity-${item.id}`} deity={item as Deity & {id: string}} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
