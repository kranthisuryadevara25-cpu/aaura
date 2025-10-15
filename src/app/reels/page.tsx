
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
  }, [videoItems]); // Added videoItems to dependency array


  if (loading && videoItems.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const itemsToRender = useMemo(() => {
    const start = Math.max(0, visibleItemIndex - VIRTUALIZATION_BUFFER);
    const end = Math.min(videoItems.length, visibleItemIndex + VIRTUALIZATION_BUFFER + 1);
    return videoItems.slice(start, end).map((item, i) => ({
      item: item,
      index: start + i
    }));
  }, [visibleItemIndex, videoItems]);

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videoItems.map((_, index) => (
        <div key={index} data-index={index} className="reel-item h-screen w-full snap-start flex items-center justify-center">
          {Math.abs(index - visibleItemIndex) <= VIRTUALIZATION_BUFFER ? (
             <ReelsFeed 
                items={[videoItems[index]]} 
                isVisible={index === visibleItemIndex} 
             />
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
      {/* Infinite scroll trigger */}
      <div ref={lastVideoElementRef} style={{ height: '1px' }} />
    </div>
  );
}

