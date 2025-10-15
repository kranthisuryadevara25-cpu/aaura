
'use client';

import { FeedSidebar } from "@/components/feed-sidebar";
import { VideoPlayer } from "@/components/video-player";
import { useFeed } from '@/hooks/use-feed';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMemo } from "react";

export default function WatchPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { allItems, loading } = useFeed(20);

  const upNextItems = useMemo(() => {
    return allItems.filter(item => item.id !== `media-${id}`);
  }, [allItems, id]);

  const handleVideoEnd = () => {
    if (upNextItems.length > 0) {
      const nextItem = upNextItems[0];
      const nextHref = nextItem.kind === 'video' 
          ? `/watch/${nextItem.id.replace('media-', '')}`
          : `/${nextItem.kind}s/${nextItem.meta?.slug}`;
      router.push(nextHref);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <VideoPlayer contentId={id} onVideoEnd={handleVideoEnd} />
      </div>
      <aside className="w-[400px] border-l border-border overflow-y-auto hidden lg:block">
        <FeedSidebar items={upNextItems} />
      </aside>
    </div>
  );
}
