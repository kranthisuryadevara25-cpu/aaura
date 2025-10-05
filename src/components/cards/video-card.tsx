
'use client';

import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

const AuthorInfo = ({ userId }: { userId: string }) => {
  const [author] = useDocumentData(userId ? doc(db, 'users', userId) : undefined);
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={author?.photoURL} />
        <AvatarFallback>{author?.displayName?.[0] || 'A'}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{author?.displayName || 'Creator'}</p>
        <p className="text-xs text-muted-foreground">1.2M Subscribers</p> {/* Placeholder */}
      </div>
    </div>
  );
};


export function VideoCard({ video }: { video: any }) {
    const { language } = useLanguage();
    const title = video[`title_${language}`] || video.title_en;
    const views = video.views || 0;
    const createdAt = video.uploadDate?.toDate();

    return (
       <Link href={`/watch/${video.id}`} className="group block">
            <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                <Image
                    src={video.thumbnailUrl || 'https://picsum.photos/seed/video-placeholder/800/450'}
                    alt={title}
                    fill
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex gap-4">
                 {video.userId && <AuthorInfo userId={video.userId} />}
                 <div className="flex-1">
                    <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground mb-1">{title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{views.toLocaleString()} views</span>
                        &bull;
                        <span>{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'New'}</span>
                    </div>
                 </div>
            </div>
       </Link>
    );
}
