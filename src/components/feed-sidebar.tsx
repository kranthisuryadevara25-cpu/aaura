
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

export function FeedSidebar({ currentId }: { currentId: string }) {
  const { language } = useLanguage();
  
  const mediaQuery = query(
    collection(db, 'media'),
    where('status', '==', 'approved'),
    orderBy('uploadDate', 'desc'),
    limit(20)
  );
  const [media, isLoading] = useCollectionData(mediaQuery, { idField: 'id' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upNextItems = (media || [])
    .filter(item => item.id !== currentId)
    .map(item => ({
        id: item.id,
        type: 'video',
        title: item[`title_${language}`] || item.title_en,
        thumbnail: item.thumbnailUrl || 'https://picsum.photos/seed/video-placeholder/400/225',
        href: `/watch/${item.id}`,
        channel: item.channelName || 'Aaura Content' // Placeholder
      }));

  return (
    <div className="flex flex-col gap-3 p-4">
        <h2 className="text-xl font-bold px-2">Up Next</h2>
        {upNextItems.map(item => (
            <Link key={item.id} href={item.href} className="group">
              <div className="flex gap-3 hover:bg-secondary p-2 rounded-lg cursor-pointer transition-colors">
                <div className="relative w-40 h-24 shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">
                    {item.title}
                  </h3>
                   <p className="text-xs text-muted-foreground mt-1">{item.channel}</p>
                </div>
              </div>
            </Link>
        ))}
    </div>
  );
}
