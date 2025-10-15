
"use client";
import React from "react";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/lib/firebase/provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import type { FeedItem } from "@/types/feed";

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

  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  const getHref = () => {
    switch (item.kind) {
        case 'media':
        case 'video':
             return `/watch/${item.id.replace('media-', '')}`;
        case 'temple':
            return `/temples/${item.meta?.slug}`;
        case 'story':
            return `/stories/${item.meta?.slug}`;
        case 'deity':
             return `/deities/${item.meta?.slug}`;
        case 'forum':
        case 'post':
            return `/forum/${item.meta?.contextId || item.id.replace('post-','')}`;
        default:
            return '#';
    }
  }
  
  const title = getText(item.title);
  const description = getText(item.description);
  const authorId = item.meta?.authorId;
  const engagement = item.meta || {};
  const thumbnail = item.thumbnail || "https://picsum.photos/seed/placeholder/800/450";
  const hint = item.meta?.imageHint || "image";

  const getDeterministicDate = (id: string): Date => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
          const char = id.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
      }
      const daysAgo = Math.abs(hash) % 7;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
  }
  
  const createdAt = item.createdAt ? new Date(item.createdAt) : getDeterministicDate(item.id);

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
                    <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                </div>
                 <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-4 h-4" /> {engagement.likes || 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-4 h-4" /> {engagement.commentsCount || 0}
                    </span>
                </div>
             </div>
        </div>
    </Card>
  );
};

    