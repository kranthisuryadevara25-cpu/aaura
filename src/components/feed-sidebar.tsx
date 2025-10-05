
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { temples } from '@/lib/temples';
import { stories } from '@/lib/stories';
import { deities } from '@/lib/deities';

export function FeedSidebar({ currentId }: { currentId: string }) {
  const { language, t } = useLanguage();

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

  const getText = (field: Record<string, string> | undefined, lang: string) => {
    if (!field) return "";
    return field[lang] || field.en || "";
  };

  const videoItems = (media || []).map(item => ({
    id: item.id,
    type: 'video',
    title: getText(item as any, language) || 'Untitled Video',
    thumbnail: 'https://picsum.photos/seed/video-placeholder/400/225',
    href: `/watch/${item.id}`,
  }));

  const templeItems = temples.map(item => ({
    id: item.id,
    type: 'temple',
    title: getText(item.name, language),
    thumbnail: item.media.images[0]?.url || 'https://picsum.photos/seed/temple-placeholder/400/225',
    href: `/temples/${item.slug}`,
  }));
  
  const storyItems = stories.map(item => ({
    id: item.id,
    type: 'story',
    title: getText(item.title, language),
    thumbnail: item.image?.url || 'https://picsum.photos/seed/story-placeholder/400/225',
    href: `/stories/${item.slug}`,
  }));

  const deityItems = deities.map(item => ({
    id: item.id,
    type: 'deity',
    title: getText(item.name, language),
    thumbnail: item.images[0]?.url || 'https://picsum.photos/seed/deity-placeholder/400/225',
    href: `/deities/${item.slug}`,
  }));

  const allItems = [...videoItems, ...templeItems, ...storyItems, ...deityItems]
    .filter(item => item.id !== currentId)
    .sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col gap-3 p-4">
        <h2 className="text-xl font-bold">Up Next</h2>
        {allItems.map(item => (
            <Link key={`${item.type}-${item.id}`} href={item.href} className="group">
              <div className="flex gap-3 hover:bg-secondary/50 p-2 rounded-lg cursor-pointer transition-colors">
                <div className="relative w-40 h-24 shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="w-full h-full object-cover rounded-md"
                    />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.type}</p>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
        ))}
    </div>
  );
}
