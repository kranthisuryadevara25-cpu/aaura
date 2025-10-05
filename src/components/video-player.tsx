
'use client';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Heart, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';

export function VideoPlayer({ contentId }: { contentId: string }) {
  const { language, t } = useLanguage();

  const [media, loadingMedia] = useDocumentData(doc(db, 'media', contentId));
  const authorId = media?.userId;
  const [author, loadingAuthor] = useDocumentData(authorId ? doc(db, 'users', authorId) : undefined);

  if (loadingMedia || loadingAuthor) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!media) {
    return <div>Video not found.</div>;
  }

  const title = media[`title_${language}`] || media.title_en;
  const description = media[`description_${language}`] || media.description_en;

  return (
    <div className="w-full">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={media.mediaUrl} controls autoPlay className="w-full h-full" />
      </div>
      <div className="py-4">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={author?.photoURL} />
            <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author?.displayName || 'Creator'}</p>
            <p className="text-sm text-muted-foreground">1.2M Subscribers</p>
          </div>
          <Button variant="default">{t.buttons.subscribe}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Heart className="mr-2" /> {media.likes || 0}
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2" /> {t.buttons.share}
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="bg-secondary p-4 rounded-lg">
        <p className="font-semibold">Description</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{description}</p>
      </div>
    </div>
  );
}
