
'use client';

import { useFeed } from '@/hooks/use-feed';
import ReelsFeed from '@/components/ReelsFeed';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { FeedItem } from '@/types/feed';

const VIRTUALIZATION_BUFFER = 3;

export default function ReelsClient({ initialVideos = [] }: { initialVideos: FeedItem[] }) {
  const { allItems, loading, loadMore, canLoadMore } = useFeed(initialVideos, 5);
  const [visibleItemIndex, setVisibleItemIndex] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreObserver = useRef<IntersectionObserver | null>(null);

  const videoItems = useMemo(
    () => allItems.filter(item => item.kind === 'video' && item.mediaUrl),
    [allItems]
  );

  // Infinite scroll
  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (loadMoreObserver.current) loadMoreObserver.current.disconnect();
    loadMoreObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && canLoadMore) loadMore();
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

  const itemsToRender = useMemo(() => {
    const start = Math.max(0, visibleItemIndex - VIRTUALIZATION_BUFFER);
    const end = Math.min(videoItems.length, visibleItemIndex + VIRTUALIZATION_BUFFER + 1);
    return videoItems.slice(start, end).map((item, i) => ({
      item, index: start + i
    }));
  }, [visibleItemIndex, videoItems]);

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videoItems.length === 0 && (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}

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

      {loading && allItems.length > 0 && (
        <div className="h-screen w-full snap-start flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
