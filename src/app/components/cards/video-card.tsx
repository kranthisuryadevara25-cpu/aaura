
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import { FeedItem } from '@/types/feed';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// A placeholder function to format view counts
const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K views`;
    return `${views} views`;
}

export function VideoCard({ item }: { item: FeedItem }) {
    const { language } = useLanguage();
    const title = item.title?.[language] || item.title?.en || 'Untitled';
    const [channel, loading] = useDocumentData(item.meta?.userId ? doc(db, 'users', item.meta.userId) : undefined);

    return (
        <Link href="#" className="group">
            <div className="flex flex-col space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
                    <Image
                        src={item.thumbnail || "https://picsum.photos/seed/placeholder/600/400"}
                        alt={title}
                        data-ai-hint="spiritual video"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="flex items-start space-x-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={channel?.photoURL} alt={channel?.displayName} />
                        <AvatarFallback>{channel?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h4 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                           {title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : channel?.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatViews(item.meta?.views || 0)} &bull; {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
