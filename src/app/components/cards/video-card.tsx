
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';

// A placeholder function to get user data - in a real app this would come from a query
const getChannelData = (userId: string) => ({
    name: 'Sadhguru',
    avatarUrl: 'https://picsum.photos/seed/sadhguru/40/40',
});

// A placeholder function to format view counts
const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
    return `${views} views`;
}

export function VideoCard({ video }: { video: any }) {
    const channel = getChannelData(video.userId);

    const videoImage = placeholderImages.find(p => p.id === 'video-1') || placeholderImages[0];

    return (
        <Link href="#" className="group">
            <div className="flex flex-col space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
                    <Image
                        src={video.thumbnailUrl || videoImage.imageUrl}
                        alt={video.title}
                        data-ai-hint="spiritual video"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="flex items-start space-x-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={channel.avatarUrl} alt={channel.name} />
                        <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h4 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                           {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatViews(video.views)} &bull; {formatDistanceToNow(video.uploadDate.toDate(), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

