
"use client";
import React, { useRef, useEffect } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";

export default function ReelsFeed({ items }: { items: FeedItem[] }) {
  const { language } = useLanguage();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    // Options for the observer: trigger when 50% of the item is visible
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, 
    };

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const videoElement = (entry.target as HTMLElement).querySelector('video');
        if (!videoElement) return;

        if (entry.isIntersecting) {
          // Play the video if it's intersecting
          videoElement.play().catch((error) => {
            // Autoplay with sound is often blocked, but muted autoplay is usually allowed.
            // We already have `muted` on the video element.
            console.warn("Video autoplay failed:", error.name, error.message);
          });
        } else {
          // Pause the video if it's not intersecting
          videoElement.pause();
        }
      });
    };

    // Create the observer
    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe all the items that have been stored in our refs map
    const currentRefs = itemRefs.current;
    currentRefs.forEach((node) => {
      if (node) {
        observerRef.current?.observe(node);
      }
    });

    // Cleanup function to disconnect the observer
    return () => {
      observerRef.current?.disconnect();
      itemRefs.current.clear();
    };
  }, [items]); // Rerun effect if the items change

  const getText = (field?: Record<string, string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  return (
    <div className="h-[85vh] overflow-y-scroll snap-y snap-mandatory rounded-lg">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="snap-start h-full relative flex items-center justify-center bg-black"
          ref={(node) => {
            if (node) {
              itemRefs.current.set(item.id, node);
            } else {
              itemRefs.current.delete(item.id);
            }
          }}
        >
          {item.kind === "video" && item.mediaUrl ? (
            <video 
              src={item.mediaUrl} 
              className="w-full h-full object-cover" 
              playsInline 
              muted 
              loop
              loading="lazy"
            />
          ) : (
            <img 
              src={item.thumbnail || "/placeholder.jpg"} 
              className="w-full h-full object-cover" 
              alt={getText(item.title)} 
              loading="lazy"
            />
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
