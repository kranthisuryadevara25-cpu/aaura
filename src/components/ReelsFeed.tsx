
"use client";
import React, { useRef, useEffect, useState } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { Heart, MessageCircle, Play, Pause, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReelsFeed({ items }: { items: FeedItem[] }) {
  const { language } = useLanguage();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // State for interaction feedback
  const [showLike, setShowLike] = useState<string | null>(null);
  const [showPlayPause, setShowPlayPause] = useState<{ id: string, state: 'play' | 'pause' } | null>(null);

  // Ref for double-tap detection
  const lastTap = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
          videoElement.play().catch(() => {});
        } else {
          videoElement.pause();
          videoElement.currentTime = 0;
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    const currentRefs = itemRefs.current;
    currentRefs.forEach((node) => {
      if (node) observerRef.current?.observe(node);
    });

    return () => {
      observerRef.current?.disconnect();
      itemRefs.current.clear();
    };
  }, [items]);

  const getText = (field?: Record<string, string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[language] || field["en"] || Object.values(field)[0] || "";
  };

  const handleTap = (item: FeedItem, video: HTMLVideoElement | null) => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300;

    if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
    }
    
    // Double tap
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      handleLike(item.id);
    } 
    // Single tap
    else {
        tapTimeout.current = setTimeout(() => {
            if (video) {
                if (video.paused) {
                    video.play();
                    setShowPlayPause({ id: item.id, state: 'play' });
                } else {
                    video.pause();
                    setShowPlayPause({ id: item.id, state: 'pause' });
                }
                setTimeout(() => setShowPlayPause(null), 500);
            }
        }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  };

  const handleLike = (id: string) => {
    setShowLike(id);
    // Here you would also update the like state/count via an API call
    setTimeout(() => setShowLike(null), 1000);
  };

  return (
    <div className="h-[85vh] overflow-y-scroll snap-y snap-mandatory rounded-lg bg-black">
      {items
        .filter(item => item.kind === 'video' && item.mediaUrl) // Only show videos in reels
        .map((item) => (
        <div
          key={item.id}
          className="snap-start h-full w-full relative flex items-center justify-center"
          ref={(node) => {
            if (node) itemRefs.current.set(item.id, node);
            else itemRefs.current.delete(item.id);
          }}
          onClick={(e) => {
            const videoEl = (e.currentTarget as HTMLElement).querySelector('video');
            handleTap(item, videoEl);
          }}
        >
          <video
            src={item.mediaUrl}
            className="w-full h-full object-contain"
            playsInline
            muted
            loop
            loading="lazy"
          />

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Double-tap Like Animation */}
            {showLike === item.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-24 h-24 text-white/90 animate-in fade-in zoom-in-50" fill="currentColor" />
                </div>
            )}
            
            {/* Play/Pause Animation */}
            {showPlayPause?.id === item.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 p-4 rounded-full">
                        {showPlayPause.state === 'play' ? (
                            <Play className="w-12 h-12 text-white" fill="currentColor"/>
                        ) : (
                            <Pause className="w-12 h-12 text-white" fill="currentColor"/>
                        )}
                    </div>
                </div>
            )}
            
            {/* Info Overlay */}
            <div className="absolute bottom-4 left-4 text-white p-2 max-w-[calc(100%-6rem)]">
              <h3 className="font-bold drop-shadow-md">{getText(item.title)}</h3>
              <p className="text-sm mt-1 line-clamp-2 drop-shadow-sm">{getText(item.description)}</p>
            </div>

            {/* Actions Overlay */}
            <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white pointer-events-auto">
                <button onClick={() => handleLike(item.id)} className="flex flex-col items-center gap-1">
                    <Heart className={cn("w-8 h-8 drop-shadow-lg", showLike === item.id && "text-red-500 fill-current")} />
                    <span className="text-xs drop-shadow-md">{item.meta?.likes || 0}</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-8 h-8 drop-shadow-lg" />
                    <span className="text-xs drop-shadow-md">{item.meta?.comments || 0}</span>
                </button>
                 <button className="flex flex-col items-center gap-1">
                    <Share2 className="w-8 h-8 drop-shadow-lg" />
                    <span className="text-xs drop-shadow-md">Share</span>
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
