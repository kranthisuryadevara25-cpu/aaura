
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { TempleCard } from './cards/temple-card';
import { StoryCard } from './cards/story-card';
import { DeityCard } from './cards/deity-card';

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
    
    const templesQuery = useMemo(() => firestore ? query(collection(firestore, 'temples'), limit(5)) : null, [firestore]);
    const storiesQuery = useMemo(() => firestore ? query(collection(firestore, 'stories'), limit(5)) : null, [firestore]);
    const deitiesQuery = useMemo(() => firestore ? query(collection(firestore, 'deities'), limit(5)) : null, [firestore]);

    const { data: temples, isLoading: templesLoading } = useCollection(templesQuery);
    const { data: stories, isLoading: storiesLoading } = useCollection(storiesQuery);
    const { data: deities, isLoading: deitiesLoading } = useCollection(deitiesQuery);

    const isLoading = templesLoading || storiesLoading || deitiesLoading;
    
    useEffect(() => {
        if (!isLoading) {
            const allItems = [
                ...(temples?.map(item => ({ ...item, type: 'temple' })) || []),
                ...(stories?.map(item => ({ ...item, type: 'story' })) || []),
                ...(deities?.map(item => ({ ...item, type: 'deity' })) || []),
            ];
            // Shuffle the items for a mixed feed experience. 
            // In a real app, this would be handled by a recommendation engine.
            setFeedItems(shuffle(allItems));
        }
    }, [temples, stories, deities, isLoading]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {feedItems.map((item) => {
                switch (item.type) {
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
