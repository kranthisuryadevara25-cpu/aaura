
"use client";
import React from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


const AuthorAvatar = ({ userId }: { userId: string }) => {
  const [author, loading] = useDocumentData(userId ? doc(db, 'users', userId) : undefined);

  if (loading || !author) {
    return <div className="h-10 w-10 rounded-full bg-muted" />;
  }

  return (
     <Avatar>
        <AvatarImage src={author?.photoURL} />
        <AvatarFallback>{author?.displayName?.[0] || 'A'}</AvatarFallback>
      </Avatar>
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
    <Link href={getHref()} className="group">
      <div className="aspect-video relative mb-3">
        <Image src={item.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover rounded-lg" alt={getText(item.title)} fill />
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {item.meta?.duration ? `${Math.round(item.meta.duration / 60)}:${String(item.meta.duration % 60).padStart(2, '0')}` : item.kind.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-3">
        {item.meta?.userId && <AuthorAvatar userId={item.meta.userId} />}
        <div className="flex-1">
             <h3 className="text-md font-semibold leading-snug line-clamp-2 group-hover:text-primary">{getText(item.title)}</h3>
            <div className="text-sm text-muted-foreground mt-1">
                <p>{getText(item.meta?.channelName) || 'Aaura Content'}</p>
                <div className="flex items-center gap-2">
                    <span>{item.meta?.views ? `${item.meta.views.toLocaleString()} views` : "New"}</span>
                    &bull;
                    <span>{item.createdAt ? formatDistanceToNow(item.createdAt, { addSuffix: true }) : ''}</span>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};
