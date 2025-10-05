
"use client";
import React from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import Image from "next/image";

export const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  const { language } = useLanguage();

  // get text helpers
  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  const cardContent = (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col">
      <div className="relative aspect-video">
        <Image src={item.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={getText(item.title)} fill />
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {item.kind.toUpperCase()}
        </span>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold leading-snug truncate group-hover:text-primary">{getText(item.title)}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-grow">{getText(item.description)}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div>{item.meta?.views ? `${item.meta.views.toLocaleString()} views` : ""}</div>
          <div>{item.meta?.duration ? `${Math.round(item.meta.duration / 60)} min` : ""}</div>
        </div>
      </div>
    </div>
  );
  
  const getHref = () => {
    if (item.kind === 'video' && item.id) {
        return `/watch/${item.id.replace('video-', '')}`;
    }
    if (item.kind === 'temple' && item.meta?.slug) {
        return `/temples/${item.meta.slug}`;
    }
    if (item.kind === 'story' && item.meta?.slug) {
        return `/stories/${item.meta.slug}`;
    }
     if (item.kind === 'deity' && item.meta?.slug) {
        return `/deities/${item.meta.slug}`;
    }
    return "#";
  }


  return (
    <Link href={getHref()} className="h-full">
      {cardContent}
    </Link>
  );
};
