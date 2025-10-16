
"use client";
import React, { useTransition, useMemo } from "react";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, writeBatch, increment, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import type { FeedItem } from "@/types/feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { FirestorePermissionError } from "@/lib/firebase/errors";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { Comments } from './comments';

const AuthorAvatar = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  const authorRef = userId ? doc(db, 'users', userId) : undefined;
  const [author, loading] = useDocumentData(authorRef);

  if (loading || !author) {
    return (
        <div className="w-10 h-10 shrink-0">
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
    );
  }

  return (
     <div className="w-10 h-10 shrink-0">
        <Avatar>
            <AvatarImage src={author.photoURL} />
            <AvatarFallback>{author.displayName?.[0] || 'A'}</AvatarFallback>
        </Avatar>
     </div>
  )
}

export const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isLiking, startLikeTransition] = useTransition();
  const [showComments, setShowComments] = React.useState(false);

  const contentCollection = useMemo(() => item.kind === 'post' ? 'posts' : 'media', [item.kind]);
  const contentId = useMemo(() => item.id.replace(`${item.kind}-`, ''), [item.id, item.kind]);
  
  const contentRef = useMemo(() => doc(db, contentCollection, contentId), [db, contentCollection, contentId]);
  const [contentData, contentLoading] = useDocumentData(contentRef);
  
  const likeRef = useMemo(() => user ? doc(db, `${contentCollection}/${contentId}/likes/${user.uid}`) : undefined, [user, db, contentCollection, contentId]);

  const [like, likeLoading] = useDocumentData(likeRef);
  const isLiked = !!like;

  const handleLike = () => {
      if (!user || !contentRef || !likeRef) {
        toast({ variant: "destructive", title: "Please log in to like content." });
        return;
      }

      startLikeTransition(() => {
        const batch = writeBatch(db);
        const likeData = { createdAt: serverTimestamp() };

        if (isLiked) {
            batch.delete(likeRef);
            batch.update(contentRef, { likes: increment(-1) });
        } else {
            batch.set(likeRef, likeData);
            batch.update(contentRef, { likes: increment(1) });
        }
        
        batch.commit().catch(async (serverError) => {
            const operation = isLiked ? 'delete' : 'create';
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: operation,
                requestResourceData: operation === 'create' ? likeData : undefined,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      })
  }

  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  const getHref = () => {
    switch (item.kind) {
        case 'media':
        case 'video':
             return `/watch/${contentId}`;
        case 'temple':
            return `/temples/${item.meta?.slug}`;
        case 'story':
            return `/stories/${item.meta?.slug}`;
        case 'deity':
             return `/deities/${item.meta?.slug}`;
        case 'post':
            return `/forum/${item.meta?.contextId}`;
        default:
            return '#';
    }
  }
  
  const currentItemData = contentData || item;
  const title = getText(currentItemData.title);
  const description = getText(currentItemData.description);
  const authorId = currentItemData.meta?.authorId || currentItemData.authorId;
  const engagement = contentLoading ? item.meta : (currentItemData.meta || currentItemData);
  const thumbnail = currentItemData.thumbnail || "https://picsum.photos/seed/placeholder/800/450";
  const hint = currentItemData.meta?.imageHint || "image";
  const createdAtDate = currentItemData.createdAt?.toDate ? currentItemData.createdAt.toDate() : (item.createdAt ? new Date(item.createdAt) : undefined);
  const createdAt = createdAtDate ? formatDistanceToNow(createdAtDate, { addSuffix: true }) : 'a while ago';

  const canInteract = item.kind === 'post' || item.kind === 'media' || item.kind === 'video';
  const commentContentType = useMemo(() => (item.kind === 'video' ? 'media' : item.kind) as 'post' | 'media', [item.kind]);


  return (
    <Card className="p-4 border-none shadow-none">
        <Link href={getHref()} className="group">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image src={thumbnail} className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" alt={title} fill data-ai-hint={hint}/>
                {item.meta?.duration > 0 && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {`${Math.floor(item.meta.duration / 60)}:${String(item.meta.duration % 60).padStart(2, '0')}`}
                </span>}
            </div>
        </Link>
        <div className="flex gap-3">
             {authorId && <AuthorAvatar userId={authorId} />}
             <div className="flex-1">
                <Link href={getHref()} className="group">
                  <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary">{title || description}</h3>
                </Link>
                {title && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <span>{engagement.views ? `${engagement.views.toLocaleString()} views` : "New"}</span>
                    &bull;
                    <span>{createdAt}</span>
                </div>
                 {canInteract && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs px-2" onClick={handleLike} disabled={!user || isLiking || likeLoading}>
                            {isLiking || likeLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Heart className={`w-4 h-4 ${isLiked ? "text-red-500 fill-current" : ""}`} />} 
                            {contentLoading ? (item.meta?.likes || 0) : (engagement.likes || 0)}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-xs px-2">
                            <MessageCircle className="w-4 h-4" /> {contentLoading ? (item.meta?.commentsCount || 0) : (engagement.commentsCount || 0)}
                        </Button>
                    </div>
                 )}
             </div>
        </div>
         {showComments && canInteract && (
            <div className="mt-4">
                <Comments contentId={contentId} contentType={commentContentType} />
            </div>
        )}
    </Card>
  );
};
