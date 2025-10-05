"use client";
import React, { useRef, useEffect } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";

export default function ReelsFeed({ items }: { items: FeedItem[] }) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // optional: implement autoplay/visibility tracking with IntersectionObserver
    const el = containerRef.current;
    return () => {};
  }, [items]);

  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  return (
    <div ref={containerRef} className="h-[85vh] overflow-y-scroll snap-y snap-mandatory rounded-lg">
      {items.map((item) => (
        <div key={item.id} className="snap-start h-full relative flex items-center justify-center bg-black">
          {item.kind === "video" && item.mediaUrl ? (
            <video src={item.mediaUrl} className="w-full h-full object-cover" playsInline autoPlay muted loop />
          ) : (
            <img src={item.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover" alt={getText(item.title)} />
          )}

          <div className="absolute bottom-8 left-4 text-white p-3 bg-black/40 rounded max-w-[80%]">
            <h3 className="text-lg font-bold">{getText(item.title)}</h3>
            <p className="text-sm mt-1 line-clamp-2">{getText(item.description)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
