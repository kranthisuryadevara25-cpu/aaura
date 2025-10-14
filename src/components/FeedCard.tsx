
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

export const FeedCard: React.FC<{ item: any }> = ({ item }) => {
  const { language } = useLanguage();

  const getText = (field?: Record<string,string> | string) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field[language] || field["en"] || Object.values(field)[0] || "");
  };

  const getHref = () => {
    switch (item.type) {
        case 'media':
        case 'video':
             return `/watch/${item.id.replace('media-', '')}`;
        case 'temple':
            return `/temples/${item.cta.link.split('/').pop()}`;
        case 'story':
            return `/stories/${item.cta.link.split('/').pop()}`;
        case 'deity':
             return `/deities/${item.cta.link.split('/').pop()}`;
        case 'forum':
        case 'post':
            return `/forum/${item.id.replace('post-', '')}`;
        default:
            return '#';
    }
  }
  
  const title = getText(item.title);
  const description = getText(item.summary || item.location || item.description);
  const authorId = item.authorId || item.author?.name; // 'author.name' for media mock
  const engagement = item.engagement || {};
  const thumbnail = item.image?.url || item.media?.thumbnailUrl || "https://picsum.photos/seed/placeholder/800/450";
  const hint = item.image?.hint || item.media?.hint || "image";

  // Mock createdAt for items that don't have it
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 7);

  return (
    <Card className="p-4 border-none shadow-none">
        <Link href={getHref()} className="group">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image src={thumbnail} className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" alt={title} fill data-ai-hint={hint}/>
                {item.media?.duration > 0 && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {`${Math.floor(item.media.duration / 60)}:${String(item.media.duration % 60).padStart(2, '0')}`}
                </span>}
            </div>
        </Link>
        <div className="flex gap-3">
             {authorId && <AuthorAvatar userId={authorId} />}
             <div className="flex-1">
                <Link href={getHref()} className="group">
                  <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary">{title}</h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{engagement.views ? `${engagement.views.toLocaleString()} views` : "New"}</span>
                    &bull;
                    <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                 <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-4 h-4" /> {engagement.likes || 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-4 h-4" /> {engagement.comments || 0}
                    </span>
                </div>
             </div>
        </div>
    </Card>
  );
};
