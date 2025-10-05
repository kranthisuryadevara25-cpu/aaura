
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { placeholderImages } from '@/lib/placeholder-images';

export function FeedSidebar({ currentId }: { currentId: string }) {
  const { language } = useLanguage();

  const mediaQuery = query(
    collection(db, 'media'),
    where('status', '==', 'approved'),
    where('mediaType', '==', 'video'),
    limit(20)
  );

  const [media, loading] = useCollectionData(mediaQuery, { idField: 'id' });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upNextFeed = media?.filter((item) => item.id !== currentId);
  
  const getImageForId = (id: string) => {
      const images = placeholderImages.filter(p => p.id.startsWith('video'));
      if (!media) return images[0].imageUrl;
      // use a simple hash function to get a consistent image for each video id
      const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % images.length;
      return images[index].imageUrl;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Up Next</h2>
      {upNextFeed?.map((item: any) => {
        const title = item[`title_${language}`] || item.title_en;
        const authorId = item.userId;
        
        return (
          <Link href={`/watch/${item.id}`} key={item.id} className="flex gap-3 group">
            <div className="w-40 h-24 relative rounded-lg overflow-hidden shrink-0">
              <Image
                src={getImageForId(item.id)}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">Creator Name</p>
              <p className="text-xs text-muted-foreground">{item.views || 0} views</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
