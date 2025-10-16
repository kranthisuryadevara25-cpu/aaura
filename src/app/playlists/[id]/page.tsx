'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { Loader2, Music, PlayCircle, ListMusic } from 'lucide-react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { VideoPlayer } from '@/components/video-player';
import { useLanguage } from '@/hooks/use-language';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { language } = useLanguage();
  const id = params.id as string;

  const playlistRef = doc(db, 'playlists', id);
  const [playlist, loadingPlaylist] = useDocumentData(playlistRef);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (playlist && playlist.items && playlist.items.length > 0 && !activeVideoId) {
      setActiveVideoId(playlist.items[0].contentId);
    }
  }, [playlist, activeVideoId]);

  const mediaIds = useMemo(() => playlist?.items?.map((item: any) => item.contentId) || [], [playlist]);
  
  const mediaQuery = mediaIds.length > 0 ? query(collection(db, 'media'), where('__name__', 'in', mediaIds)) : undefined;
  const [mediaItems, loadingMedia] = useCollectionData(mediaQuery);

  const orderedMediaItems = useMemo(() => {
    if (!mediaItems || !playlist?.items) return [];
    return playlist.items
      .map((item: any) => mediaItems.find(media => media.id === item.contentId))
      .filter(Boolean); // Filter out any undefined items
  }, [playlist, mediaItems]);

  const handleVideoEnd = () => {
    const currentIndex = orderedMediaItems.findIndex(item => item.id === activeVideoId);
    if (currentIndex !== -1 && currentIndex < orderedMediaItems.length - 1) {
      const nextVideo = orderedMediaItems[currentIndex + 1];
      setActiveVideoId(nextVideo.id);
    }
  };

  if (loadingPlaylist) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return notFound();
  }

  return (
    <main className="flex w-full h-[calc(100vh-65px)] bg-background text-foreground">
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {activeVideoId ? (
                <VideoPlayer contentId={activeVideoId} onVideoEnd={handleVideoEnd} />
            ) : loadingMedia ? (
                <div className="flex justify-center items-center aspect-video bg-secondary rounded-lg">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            ) : (
                <div className="aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white">
                    <Music className="h-16 w-16 text-muted-foreground" />
                    <p className="mt-4">This playlist is empty.</p>
                </div>
            )}
        </div>

        <aside className="w-[400px] border-l border-border overflow-y-auto hidden lg:block p-4">
            <Card className="bg-transparent border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"> <ListMusic/> {playlist.title}</CardTitle>
                    <CardDescription>{playlist.items?.length || 0} videos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loadingMedia ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                    ) : orderedMediaItems.map((item: any, index) => {
                        const title = item[`title_${language}`] || item.title_en;
                        return (
                             <div
                                key={item.id}
                                onClick={() => setActiveVideoId(item.id)}
                                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all ${activeVideoId === item.id ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
                            >
                                <div className="relative w-24 h-14 shrink-0 rounded-md overflow-hidden bg-secondary">
                                    <Image src={item.thumbnailUrl} alt={title} fill className="object-cover"/>
                                    {activeVideoId === item.id && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <PlayCircle className="h-6 w-6 text-white/80" />
                                    </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-sm text-foreground line-clamp-2">{title}</h4>
                                    <p className="text-xs text-muted-foreground">{index + 1}. {item.mediaType}</p>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </aside>
    </main>
  );
}
