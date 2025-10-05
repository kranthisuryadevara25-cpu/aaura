
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { temples } from '@/lib/temples';
import { stories } from '@/lib/stories';
import { deities } from '@/lib/deities';
import { useLanguage } from '@/hooks/use-language';
import { FeedSidebar } from "@/components/feed-sidebar";
import { VideoPlayer } from "@/components/video-player";
import { Comments } from '@/components/comments';
import { Separator } from '@/components/ui/separator';

export default function WatchPage({ params }: { params: { id: string }}) {
  const { id } = params;
  const router = useRouter();
  const { language } = useLanguage();

  const [upNextItems, setUpNextItems] = useState<any[]>([]);
  
  const mediaQuery = query(
    collection(db, 'media'),
    where('status', '==', 'approved'),
    where('mediaType', '==', 'video'),
    limit(20)
  );
  const [media, loading] = useCollectionData(mediaQuery, { idField: 'id' });

  const getText = (field: Record<string, string> | undefined, lang: string) => {
    if (!field) return "";
    return field[lang] || field.en || "";
  };
  
  useEffect(() => {
    if (!loading && media) {
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
            .filter(item => item.id !== id)
            .sort(() => Math.random() - 0.5);

        setUpNextItems(allItems);
    }
  }, [id, language, loading, media]);

  const handleVideoEnd = () => {
    if (upNextItems.length > 0) {
      const nextItem = upNextItems[0];
      if(nextItem && nextItem.href) {
        router.push(nextItem.href);
      }
    }
  }

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      <div className="flex-1 p-4 overflow-y-auto">
        <VideoPlayer contentId={id} onVideoEnd={handleVideoEnd} />
        <Separator className="my-6" />
        <Comments contentId={id} contentType="media" />
      </div>
      <aside className="w-[400px] border-l border-border overflow-y-auto hidden lg:block">
        <FeedSidebar items={upNextItems} isLoading={loading} />
      </aside>
    </div>
  );
}
