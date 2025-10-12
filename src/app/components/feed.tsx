
"use client";
import React, { useState, useMemo } from "react";
import { useFeed } from "@/hooks/use-feed";
import ReelsFeed from "@/components/ReelsFeed"; 
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedCard } from "@/components/FeedCard";
import { useLanguage } from "@/hooks/use-language";

export function Feed({ searchQuery }: { searchQuery: string }) {
  const { allItems, loading, filterItems } = useFeed(20);
  const [view, setView] = useState<"grid"|"reels">("grid");
  const { t } = useLanguage();

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
          <Button onClick={() => setView("grid")} variant={view === 'grid' ? 'default' : 'outline'}>{t.sidebar.home}</Button>
          <Button onClick={() => setView("reels")} variant={view === 'reels' ? 'default' : 'outline'}>Reels</Button>
        </div>
      </div>

      {view === "reels" ? (
        <ReelsFeed items={reelsItems} />
      ) : (
        <div className="grid grid-cols-1 gap-y-12">
            {displayedItems.map((item) => {
                return <FeedCard key={item.id} item={item} />
            })}
        </div>
      )}
    </div>
  );
}
