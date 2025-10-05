// src/components/ReelsFeed.tsx
import React from 'react';
import type { FeedItem } from '@/types/feed';

interface ReelsFeedProps {
  items: FeedItem[];
}

const ReelsFeed: React.FC<ReelsFeedProps> = ({ items }) => {
  const reelItems = items.filter(item => item.kind === 'video' || item.meta?.mediaType === 'short');

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-sm h-[80vh] bg-black rounded-xl flex flex-col items-center justify-center text-white">
        <p className="text-lg">Reels View</p>
        <p className="text-sm text-muted-foreground">(Coming Soon)</p>
        <p className="text-xs mt-4">{reelItems.length} potential reels found in feed.</p>
      </div>
    </div>
  );
};

export default ReelsFeed;
