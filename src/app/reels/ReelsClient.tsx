
'use client';

import { useFeed } from '@/hooks/use-feed';
import ReelsFeed from '@/components/ReelsFeed';
import { Loader2, VideoOff } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { FeedItem } from '@/types/feed';

const VIRTUALIZATION_BUFFER = 3;

export default function ReelsClient({ initialVideos = [] }: { initialVideos: FeedItem[] }) {
  const { allItems, loading, loadMore, canLoadMore } = useFeed(initialVideos, 5);
  const [visibleItemIndex, setVisibleItemIndex] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreObserver = useRef<IntersectionObserver | null>(null);

  const videoItems = useMemo(
    () => allItems.filter(item => (item.kind === 'video' || item.kind === 'media') && item.mediaUrl),
    [allItems]
  );

  // Infinite scroll
  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (loadMoreObserver.current) loadMoreObserver.current.disconnect();
    loadMoreObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && canLoadMore) {
        loadMore();
      }
    });
    if (node) loadMoreObserver.current.observe(node);
  }, [loading, canLoadMore, loadMore]);

  // Track visible reel
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          setVisibleItemIndex(index);
        }
      });
    }, { threshold: 0.5 });

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [videoItems]);


  if (videoItems.length === 0 && !loading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
            <VideoOff className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No Reels Found</h2>
            <p className="mt-2 text-muted-foreground">There's no video content available to display right now.</p>
        </div>
    );
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videoItems.map((item, index) => (
        <div
          key={item.id}
          ref={index === videoItems.length - 1 ? lastVideoElementRef : null}
          data-index={index}
          className="reel-item h-screen w-full snap-start flex items-center justify-center"
        >
          {Math.abs(index - visibleItemIndex) <= VIRTUALIZATION_BUFFER ? (
            <ReelsFeed items={[item]} isVisible={index === visibleItemIndex} />
          ) : (
            <div className="h-full w-full bg-black flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="h-screen w-full snap-start flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
