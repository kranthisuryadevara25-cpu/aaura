
"use client";
import React, { useRef, useEffect, useState, useMemo, useTransition } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { Heart, MessageCircle, Play, Pause, Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Comments } from "@/components/comments";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, writeBatch, increment, serverTimestamp } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { FirestorePermissionError } from "@/lib/firebase/errors";
import { errorEmitter } from "@/lib/firebase/error-emitter";

export default function ReelsFeed({ items, isVisible }: { items: FeedItem[], isVisible?: boolean }) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [isLiking, startLikeTransition] = useTransition();

  const [showLike, setShowLike] = useState<string | null>(null);
  const [showPlayPause, setShowPlayPause] = useState<{ id: string, state: 'play' | 'pause' } | null>(null);
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
  
  const item = items[0];
  const contentId = useMemo(() => item?.id.replace(`${item.kind}-`, ''), [item]);
  const contentCollection = useMemo(() => {
    if (item?.kind === 'video') return 'media';
    return `${item?.kind}s`;
  }, [item?.kind]);

  const contentRef = useMemo(() => contentId && db ? doc(db, contentCollection, contentId) : undefined, [db, contentCollection, contentId]);
  const [contentData] = useDocumentData(contentRef);
  
  const likeRef = useMemo(() => user && contentRef ? doc(db, `${contentCollection}/${contentId}/likes/${user.uid}`) : undefined, [user, db, contentCollection, contentId, contentRef]);
  const [like, loadingLike] = useDocumentData(likeRef);
  
  const initialLikes = item.meta?.likes || contentData?.likes || 0;
  const [optimisticLikes, setOptimisticLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setOptimisticLikes(contentData?.likes ?? initialLikes);
    setIsLiked(!!like);
  }, [contentData, like, initialLikes]);

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
     if (!user || !contentRef || !likeRef) {
        toast({ variant: "destructive", title: "Please log in to like content." });
        return;
      }
    if (!isLiked) {
      setShowLike(id);
      setTimeout(() => setShowLike(null), 1000);
    }
    
    startLikeTransition(() => {
        const wasLiked = isLiked;
        // Optimistic UI update
        setIsLiked(!wasLiked);
        setOptimisticLikes((prev: number) => wasLiked ? prev - 1 : prev + 1);

        const batch = writeBatch(db);
        const likeData = { createdAt: serverTimestamp() };

        if (wasLiked) {
            batch.delete(likeRef);
            batch.update(contentRef, { likes: increment(-1) });
        } else {
            batch.set(likeRef, likeData);
            batch.update(contentRef, { likes: increment(1) });
        }
        
        batch.commit().catch(async (serverError) => {
            setIsLiked(wasLiked);
            setOptimisticLikes(initialLikes);
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: wasLiked ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      })
  };
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
        title: getText(item.title),
        text: getText(item.description),
        url: window.location.origin + `/watch/${contentId}`,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for desktop browsers
            await navigator.clipboard.writeText(shareData.url);
            toast({ title: "Link Copied!", description: "The video link has been copied to your clipboard." });
        }
    } catch (error) {
        console.error("Share failed:", error);
        toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not share the video.' });
    }
  };

  const commentContentType = useMemo(() => {
    const kind = items[0]?.kind;
    if (kind === 'video') return 'media';
    if (kind === 'post') return 'post';
    return kind as 'post' | 'media' | 'manifestation';
  }, [items]);


  if (!item) return null;

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
                {isLiking || loadingLike ? <Loader2 className="w-8 h-8 animate-spin" /> : <Heart className={cn("w-8 h-8 drop-shadow-lg", isLiked && "text-red-500 fill-current")} />}
                <span className="text-xs drop-shadow-md">{optimisticLikes}</span>
            </button>
             <Sheet open={isCommentSheetOpen} onOpenChange={setCommentSheetOpen}>
                <SheetTrigger asChild>
                     <button onClick={(e) => {e.stopPropagation(); setCommentSheetOpen(true);}} className="flex flex-col items-center gap-1">
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
             <button onClick={handleShare} className="flex flex-col items-center gap-1">
                <Share2 className="w-8 h-8 drop-shadow-lg" />
                <span className="text-xs drop-shadow-md">Share</span>
            </button>
        </div>
      </div>
    </div>
  );
}
