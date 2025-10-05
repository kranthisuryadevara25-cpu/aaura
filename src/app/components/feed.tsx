
"use client";
import React, { useState, useMemo } from "react";
import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/FeedCard";
import ReelsFeed from "@/components/ReelsFeed"; 
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./cards/video-card";
import { DeityCard } from "./cards/deity-card";

export function Feed({ searchQuery }: { searchQuery: string }) {
  const { allItems, loading, filterItems } = useFeed(20);
  const [view, setView] = useState<"grid"|"reels">("grid");

  const displayedItems = useMemo(() => {
    if (searchQuery) {
        return filterItems(searchQuery);
    }
    return allItems;
  }, [searchQuery, allItems, filterItems]);

  const reelsItems = useMemo(() => {
      return displayedItems.filter(item => item.kind === 'video' && item.mediaUrl);
  }, [displayedItems])

  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-start mb-4">
        <div className="flex gap-2">
          <Button onClick={() => setView("grid")} variant={view === 'grid' ? 'default' : 'outline'}>Home</Button>
          <Button onClick={() => setView("reels")} variant={view === 'reels' ? 'default' : 'outline'}>Reels</Button>
        </div>
      </div>

      {view === "reels" ? (
        <ReelsFeed items={reelsItems} />
      ) : (
        <div className="space-y-8">
            {displayedItems.map((item) => {
                if(item.kind === 'video') return <VideoCard key={item.id} video={item} />;
                if(item.kind === 'deity') return <DeityCard key={item.id} deity={item} />;
                // We can add more card types here for story, temple etc.
                return <FeedCard key={item.id} item={item} />
            })}
        </div>
      )}
    </div>
  );
}
