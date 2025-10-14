
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

const AuthorAvatar = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  const [author, loading] = useDocumentData(userId ? doc(db, 'users', userId) : undefined);

  if (loading || !author) {
    return (
        <div className="w-10 h-10 shrink-0">
            <div className="h-10 w-10 rounded-full bg-muted" />
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
             return `/watch/${item.id}`;
        case 'temple':
            return `/temples/${item.slug}`;
        case 'story':
            return `/stories/${item.slug}`;
        case 'deity':
             return `/deities/${item.slug}`;
        case 'forum':
        case 'post':
            return `/forum/${item.id}`;
        default:
            return '#';
    }
  }

  const title = getText(item.title_en ? { en: item.title_en, hi: item.title_hi, te: item.title_te } : (item.title || item.name || item.name_en));
  const description = getText(item.description_en ? { en: item.description_en, hi: item.description_hi, te: item.description_te } : (item.description || item.summary || item.location));
  const authorName = item.userId || item.authorId;
  const thumbnail = item.thumbnailUrl || item.image?.url || item.imageUrl;
  
  const createdAt = item.uploadDate?.toDate() || item.createdAt?.toDate() || null;

  return (
    <Card className="p-4 border-none shadow-none">
        <Link href={getHref()} className="group">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image src={thumbnail || "https://picsum.photos/seed/placeholder/800/450"} className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" alt={title} fill />
                {item.duration > 0 && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {`${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}`}
                </span>}
            </div>
        </Link>
        <div className="flex gap-3">
             {authorName && <AuthorAvatar userId={authorName} />}
             <div className="flex-1">
                <Link href={getHref()} className="group">
                  <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary">{title}</h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{item.views ? `${item.views.toLocaleString()} views` : "New"}</span>
                    &bull;
                    <span>{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : ''}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                 <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-4 h-4" /> {item.likes || 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-4 h-4" /> {item.commentsCount || 0}
                    </span>
                </div>
             </div>
        </div>
    </Card>
  );
};
