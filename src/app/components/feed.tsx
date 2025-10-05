// src/app/components/feed.tsx
"use client";
import React, { useState } from "react";
import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/FeedCard";
import ReelsFeed from "@/components/ReelsFeed"; 
import { Loader2 } from "lucide-react";

export function Feed() {
  const { items, loading } = useFeed(20);
  const [view, setView] = useState<"grid"|"reels">("grid");

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-start mb-4">
        <div className="flex gap-2">
          <button onClick={() => setView("grid")} className={`px-3 py-1 rounded-md text-sm font-medium ${view==="grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Home</button>
          <button onClick={() => setView("reels")} className={`px-3 py-1 rounded-md text-sm font-medium ${view==="reels" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Reels</button>
        </div>
      </div>

      {view === "reels" ? (
        <ReelsFeed items={items} />
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((it) => <FeedCard key={it.id} item={it} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
