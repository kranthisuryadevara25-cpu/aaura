
'use client';

import { useFeed } from '@/hooks/use-feed';
import ReelsFeed from '@/components/ReelsFeed';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import type { FeedItem } from '@/types/feed';

const VIRTUALIZATION_BUFFER = 5; // Render 5 items before and after the visible one

export default function ReelsPage() {
  const { allItems, loading } = useFeed(50); // Fetch more items for a better reels experience
  const [visibleItemIndex, setVisibleItemIndex] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const videoItems = useMemo(() => {
    return allItems.filter(item => item.kind === 'video' && item.mediaUrl);
  }, [allItems]);

  // This effect sets up an IntersectionObserver to track which video is visible
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
      { threshold: 0.5 } // Trigger when 50% of the item is visible
    );

    const elements = document.querySelectorAll('.reel-item');
    elements.forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [videoItems]); // Rerun when videoItems change

  // Determine the subset of items to render
  const virtualizedItems = useMemo(() => {
    const startIndex = Math.max(0, visibleItemIndex - VIRTUALIZATION_BUFFER);
    const endIndex = Math.min(videoItems.length, visibleItemIndex + VIRTUALIZATION_BUFFER + 1);
    return videoItems.slice(startIndex, endIndex).map((item, i) => ({
      ...item,
      originalIndex: startIndex + i // Keep track of the original index for proper spacing
    }));
  }, [visibleItemIndex, videoItems]);

  if (loading && videoItems.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Use a container with a calculated height to maintain scrollbar position
  return (
    <div className="h-screen w-full relative bg-black">
      <div style={{ height: `${videoItems.length * 100}vh`, position: 'relative' }}>
        {virtualizedItems.map(item => (
          <div
            key={item.id}
            className="reel-item h-screen w-full"
            data-index={item.originalIndex}
            style={{ position: 'absolute', top: `${item.originalIndex * 100}vh`, left: 0, right: 0 }}
          >
            <ReelsFeed items={[item]} />
          </div>
        ))}
      </div>
    </div>
  );
}
