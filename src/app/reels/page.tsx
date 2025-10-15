
'use client';

import { useFeed } from '@/hooks/use-feed';
import ReelsFeed from '@/components/ReelsFeed';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import type { FeedItem } from '@/types/feed';

const VIRTUALIZATION_BUFFER = 3;

export default function ReelsPage() {
  const { allItems, loading, loadMore, canLoadMore } = useFeed(5); // Fetch smaller batches
  const [visibleItemIndex, setVisibleItemIndex] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const videoItems = useMemo(() => {
    return allItems.filter(item => item.kind === 'video' && item.mediaUrl);
  }, [allItems]);

  // Observer for infinite scroll
  const loadMoreObserver = useRef<IntersectionObserver | null>(null);
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

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleItemIndex(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [videoItems]);


  if (loading && videoItems.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videoItems.map((item, index) => (
        <div
          key={item.id}
          className="reel-item h-screen w-full snap-start"
          data-index={index}
          ref={index === videoItems.length - 1 ? lastVideoElementRef : null}
        >
          <ReelsFeed items={[item]} isVisible={index === visibleItemIndex} />
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
