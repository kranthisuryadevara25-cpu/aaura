
'use client';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Loader2, Heart, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Comments } from './comments';
import { Separator } from './ui/separator';

export function VideoPlayer({ contentId }: { contentId: string }) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const mediaRef = doc(db, 'media', contentId);
  const [media, loadingMedia] = useDocumentData(mediaRef);
  
  const authorId = media?.userId;
  const [author, loadingAuthor] = useDocumentData(authorId ? doc(db, 'users', authorId) : undefined);

  const handleLike = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: "You must be logged in to like a video." });
      return;
    }
    // In a real app, you'd check if the user has already liked it.
    // For now, we'll just increment the count.
    await updateDoc(mediaRef, {
      likes: increment(1)
    });
    toast({ title: "Liked!" });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "The video link has been copied to your clipboard." });
  }

  const handleSubscribe = () => {
    if (!user) {
      toast({ variant: 'destructive', title: "You must be logged in to subscribe." });
      return;
    }
     // Firestore logic to add to a 'subscriptions' subcollection would go here
    toast({ title: "Subscribed!", description: `You are now subscribed to ${author?.displayName || 'this channel'}.` });
  }

  if (loadingMedia || loadingAuthor) {
    return (
      <div className="flex justify-center items-center aspect-video bg-secondary rounded-lg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!media) {
    return <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">Video not found.</div>;
  }

  const title = media[`title_${language}`] || media.title_en;
  const description = media[`description_${language}`] || media.description_en;

  return (
    <div className="w-full">
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video 
          key={contentId}
          src={media.mediaUrl} 
          controls 
          autoPlay 
          className="w-full h-full"
        />
      </div>
      
      <h1 className="text-xl lg:text-2xl font-bold font-headline leading-tight">{title}</h1>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={author?.photoURL} />
            <AvatarFallback>{author?.displayName?.[0] || 'C'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author?.displayName || 'Creator'}</p>
            {/* In a real app, this would be a dynamic value */}
            <p className="text-sm text-muted-foreground">1.2M Subscribers</p> 
          </div>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="default">{t.buttons.subscribe}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Subscribe to {author?.displayName || 'this channel'}?</AlertDialogTitle>
                      <AlertDialogDescription>
                          You'll be notified about new videos and updates from this creator.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubscribe}>Subscribe</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleLike}>
            <Heart className="mr-2" /> {media.likes || 0}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2" /> {t.buttons.share}
          </Button>
        </div>
      </div>
      
      <div className="bg-secondary/50 p-4 rounded-lg mt-4">
        <p className="font-semibold text-sm">Description</p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-1">{description}</p>
      </div>

      <Separator className="my-6" />
      <Comments contentId={contentId} contentType="media" />
    </div>
  );
}
