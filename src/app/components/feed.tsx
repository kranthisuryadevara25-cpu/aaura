// src/app/components/feed.tsx
"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/FeedCard";
import ReelsFeed from "@/components/ReelsFeed"; 
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Feed() {
  const { allItems, loading, filterItems } = useFeed(20);
  const [view, setView] = useState<"grid"|"reels">("grid");
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const displayedItems = useMemo(() => {
    if (searchQuery) {
        return filterItems(searchQuery);
    }
    return allItems;
  }, [searchQuery, allItems, filterItems]);

  const reelsItems = useMemo(() => {
      return displayedItems.filter(item => item.kind === 'video' && item.mediaUrl);
  }, [displayedItems])

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
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedItems.map((it) => <FeedCard key={it.id} item={it} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
