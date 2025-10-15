
"use client";
import React, { useRef, useEffect, useState } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { Heart, MessageCircle, Play, Pause, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReelsFeed({ items, isVisible }: { items: FeedItem[], isVisible?: boolean }) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for interaction feedback
  const [showLike, setShowLike] = useState<string | null>(null);
  const [showPlayPause, setShowPlayPause] = useState<{ id: string, state: 'play' | 'pause' } | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Ref for double-tap detection
  const lastTap = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isVisible]);

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
    if (!isLiked) {
      setShowLike(id);
      setTimeout(() => setShowLike(null), 1000);
    }
    setIsLiked(prev => !prev);
    // Here you would also update the like state/count via an API call
  };

  if (!items || items.length === 0) return null;

  const item = items[0];

  return (
    <div
      className="h-full w-full relative flex items-center justify-center"
      onClick={(e) => {
        handleTap(item, videoRef.current);
      }}
    >
      <video
        ref={videoRef}
        src={item.mediaUrl}
        poster={item.thumbnail || '/placeholder.jpg'}
        preload="metadata"
        playsInline
        muted
        loop
        className="w-full h-full object-contain"
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
            <button onClick={(e) => { e.stopPropagation(); handleLike(item.id); }} className="flex flex-col items-center gap-1">
                <Heart className={cn("w-8 h-8 drop-shadow-lg", isLiked && "text-red-500 fill-current")} />
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
  );
}
