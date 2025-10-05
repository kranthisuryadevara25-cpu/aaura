"use client";
import React from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";

export const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  const { language } = useLanguage();

  // get text helpers
  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative aspect-video">
        {item.kind === "video" && item.mediaUrl ? (
          // show thumbnail; not auto-play in grid
          <img src={item.thumbnail || "/placeholder-video.jpg"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={getText(item.title)} />
        ) : (
          <img src={item.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={getText(item.title)} />
        )}
        {/* small badge for item type */}
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {item.kind.toUpperCase()}
        </span>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold leading-snug truncate group-hover:text-primary">{getText(item.title)}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getText(item.description)}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div>{item.meta?.views ? `${item.meta.views.toLocaleString()} views` : ""}</div>
          <div>{item.meta?.duration ? `${Math.round(item.meta.duration / 60)} min` : ""}</div>
        </div>
      </div>
    </div>
  );
};
