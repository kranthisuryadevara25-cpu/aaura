
'use client';

import { useEffect, useRef } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, updateDoc, increment, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
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

export function VideoPlayer({ contentId, onVideoEnd }: { contentId: string, onVideoEnd: () => void }) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRef = doc(db, 'media', contentId);
  const [media, loadingMedia] = useDocumentData(mediaRef);
  
  const authorId = media?.userId;
  const [author, loadingAuthor] = useDocumentData(authorId ? doc(db, 'users', authorId) : undefined);
  
  const likeRef = user ? doc(db, `media/${contentId}/likes`, user.uid) : undefined;
  const [like, loadingLike] = useDocumentData(likeRef);

  const subscriptionRef = user && authorId ? doc(db, `users/${user.uid}/subscriptions`, authorId) : undefined;
  const [subscription, loadingSubscription] = useDocumentData(subscriptionRef);


  useEffect(() => {
    const videoElement = videoRef.current;
    const handleViewCount = () => {
      // Increment view count only once per session
      const viewed = sessionStorage.getItem(`viewed-${contentId}`);
      if (!viewed) {
        updateDoc(mediaRef, { views: increment(1) });
        sessionStorage.setItem(`viewed-${contentId}`, 'true');
      }
    };

    if (videoElement) {
      videoElement.addEventListener('ended', onVideoEnd);
      videoElement.addEventListener('play', handleViewCount, { once: true });
      return () => {
        videoElement.removeEventListener('ended', onVideoEnd);
        videoElement.removeEventListener('play', handleViewCount);
      };
    }
  }, [contentId, onVideoEnd, mediaRef]);

  const handleLike = async () => {
    if (!user || !likeRef) {
      toast({ variant: 'destructive', title: "You must be logged in to like a video." });
      return;
    }
    try {
        if (like) {
            await deleteDoc(likeRef);
            await updateDoc(mediaRef, { likes: increment(-1) });
        } else {
            await setDoc(likeRef, { userId: user.uid });
            await updateDoc(mediaRef, { likes: increment(1) });
        }
    } catch(e) {
        console.error("Error liking video: ", e);
        toast({ variant: 'destructive', title: 'Something went wrong.'});
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "The video link has been copied to your clipboard." });
  }

  const handleSubscribe = async () => {
    if (!user || !subscriptionRef || !authorId) {
      toast({ variant: 'destructive', title: "You must be logged in to subscribe." });
      return;
    }
    
    const userRef = doc(db, 'users', user.uid);
    const authorRef = doc(db, 'users', authorId);

    try {
        if (subscription) {
            // Unsubscribe
            await deleteDoc(subscriptionRef);
            // Decrement counts
            await updateDoc(userRef, { followingCount: increment(-1) });
            await updateDoc(authorRef, { followerCount: increment(-1) });

            toast({ title: "Unsubscribed", description: `You have unsubscribed from ${author?.displayName || 'this channel'}.` });
        } else {
           // Subscribe
           await setDoc(subscriptionRef, {
              channelId: authorId,
              subscriptionDate: serverTimestamp(),
            });
            // Increment counts
            await updateDoc(userRef, { followingCount: increment(1) });
            await updateDoc(authorRef, { followerCount: increment(1) });

          toast({ title: "Subscribed!", description: `You are now subscribed to ${author?.displayName || 'this channel'}.` });
        }
    } catch (e) {
        console.error("Error subscribing: ", e);
        toast({ variant: 'destructive', title: 'Something went wrong.'});
    }
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
          ref={videoRef}
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
            <p className="text-sm text-muted-foreground">{media.views || 0} views</p> 
          </div>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="default" disabled={loadingSubscription || !user} >
                    {subscription ? t.buttons.subscribed : t.buttons.subscribe}
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>
                        {subscription ? "Unsubscribe from" : "Subscribe to"} {author?.displayName || 'this channel'}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                          You can always change your mind later.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubscribe}>{subscription ? 'Unsubscribe' : 'Subscribe'}</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleLike} disabled={loadingLike || !user}>
            <Heart className={`mr-2 h-4 w-4 ${like ? 'text-red-500 fill-current' : ''}`} /> {media.likes || 0}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t.buttons.share}
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
