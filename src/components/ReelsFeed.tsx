
"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { Heart, MessageCircle, Play, Pause, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Comments } from "./comments";

export default function ReelsFeed({ items, isVisible }: { items: FeedItem[], isVisible?: boolean }) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showLike, setShowLike] = useState<string | null>(null);
  const [showPlayPause, setShowPlayPause] = useState<{ id: string, state: 'play' | 'pause' } | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);

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
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      handleLike(item.id);
    } 
    else {
        tapTimeout.current = setTimeout(() => {
            if (video) {
                if (video.paused) {
                    video.play().catch(()=>{});
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
  };
  
  const contentId = useMemo(() => items[0]?.id.replace(`${items[0]?.kind}-`, ''), [items]);
  const commentContentType = useMemo(() => {
    const kind = items[0]?.kind;
    if (kind === 'video') return 'media';
    if (kind === 'post') return 'post';
    return kind as 'post' | 'media' | 'manifestation';
  }, [items]);


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

      <div className="absolute inset-0 pointer-events-none">
        {showLike === item.id && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-24 h-24 text-white/90 animate-in fade-in zoom-in-50" fill="currentColor" />
            </div>
        )}
        
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
        
        <div className="absolute bottom-4 left-4 text-white p-2 max-w-[calc(100%-6rem)]">
          <h3 className="font-bold drop-shadow-md">{getText(item.title)}</h3>
          <p className="text-sm mt-1 line-clamp-2 drop-shadow-sm">{getText(item.description)}</p>
        </div>

        <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white pointer-events-auto">
            <button onClick={(e) => { e.stopPropagation(); handleLike(item.id); }} className="flex flex-col items-center gap-1">
                <Heart className={cn("w-8 h-8 drop-shadow-lg", isLiked && "text-red-500 fill-current")} />
                <span className="text-xs drop-shadow-md">{item.meta?.likes || 0}</span>
            </button>
             <Sheet open={isCommentSheetOpen} onOpenChange={setCommentSheetOpen}>
                <SheetTrigger asChild>
                     <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
                        <MessageCircle className="w-8 h-8 drop-shadow-lg" />
                        <span className="text-xs drop-shadow-md">{item.meta?.commentsCount || 0}</span>
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] flex flex-col rounded-t-lg">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>Comments</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <Comments contentId={contentId} contentType={commentContentType} />
                    </div>
                </SheetContent>
            </Sheet>
             <button className="flex flex-col items-center gap-1">
                <Share2 className="w-8 h-8 drop-shadow-lg" />
                <span className="text-xs drop-shadow-md">Share</span>
            </button>
        </div>
      </div>
    </div>
  );
}
