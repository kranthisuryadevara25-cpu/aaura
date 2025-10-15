'use client';

import { useFeed } from '@/hooks/use-feed';
import ReelsFeed from '@/components/ReelsFeed';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { FeedItem } from '@/types/feed';

export default function ReelsPage() {
  // We can increase the page size for a better reels experience
  const { allItems, loading } = useFeed(50);

  const videoItems = useMemo(() => {
    return allItems.filter(item => item.kind === 'video' && item.mediaUrl);
  }, [allItems]);

  if (loading && videoItems.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <ReelsFeed items={videoItems} />;
}
