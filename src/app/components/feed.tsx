
'use client';

import { Loader2 } from 'lucide-react';
import { TempleCard } from './cards/temple-card';
import { StoryCard } from './cards/story-card';
import { DeityCard } from './cards/deity-card';
import { VideoCard } from './cards/video-card';
import { useFeed } from '@/hooks/use-feed';
import type { FeedItem } from '@/types/feed';

export function Feed() {
    const { items, loading } = useFeed();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8">
            {items.map((item: FeedItem) => {
                switch (item.kind) {
                    case 'video':
                        return <VideoCard key={`video-${item.id}`} item={item} />;
                    case 'temple':
                        return <TempleCard key={`temple-${item.id}`} item={item} />;
                    case 'story':
                        return <StoryCard key={`story-${item.id}`} item={item} />;
                    case 'deity':
                        return <DeityCard key={`deity-${item.id}`} item={item} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
