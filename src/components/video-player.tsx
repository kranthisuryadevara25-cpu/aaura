
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, updateDoc, increment, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
import { SaveToPlaylistDialog } from './SaveToPlaylistDialog';

export function VideoPlayer({ contentId, onVideoEnd }: { contentId: string, onVideoEnd: () => void }) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRef = useMemo(() => doc(db, 'media', contentId), [db, contentId]);
  const [media, loadingMedia] = useDocumentData(mediaRef);
  
  const authorId = media?.userId;
  const authorRef = useMemo(() => (authorId ? doc(db, 'users', authorId) : undefined), [db, authorId]);
  const [author, loadingAuthor] = useDocumentData(authorRef);
  
  const likeRef = useMemo(() => (user ? doc(db, `media/${contentId}/likes/${user.uid}`) : undefined), [db, contentId, user]);
  const [like, loadingLike] = useDocumentData(likeRef);

  const followingRef = useMemo(() => (user && authorId ? doc(db, `users/${user.uid}/following`, authorId) : undefined), [db, user, authorId]);
  const [following, loadingFollowing] = useDocumentData(followingRef);


  useEffect(() => {
    const videoElement = videoRef.current;
    const handleViewCount = () => {
      // Increment view count only once per session
      if (typeof window !== 'undefined') {
        const viewed = sessionStorage.getItem(`viewed-${contentId}`);
        if (!viewed) {
          updateDoc(mediaRef, { views: increment(1) });
          sessionStorage.setItem(`viewed-${contentId}`, 'true');
        }
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
    const batch = writeBatch(db);
    try {
        if (like) {
            batch.delete(likeRef);
            batch.update(mediaRef, { likes: increment(-1) });
        } else {
            batch.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
            batch.update(mediaRef, { likes: increment(1) });
        }
        await batch.commit();
    } catch(e) {
        console.error("Error liking video: ", e);
        toast({ variant: 'destructive', title: 'Something went wrong.'});
    }
  };
  
  const handleShare = () => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied!", description: "The video link has been copied to your clipboard." });
    }
  }

  const handleFollow = async () => {
    if (!user || !followingRef || !authorId || !authorRef) {
      toast({ variant: 'destructive', title: "You must be logged in to follow a user." });
      return;
    }
    
    const currentUserRef = doc(db, 'users', user.uid);
    const targetUserRef = doc(db, 'users', authorId);
    const userFollowersRef = doc(db, `users/${authorId}/followers`, user.uid);

    const batch = writeBatch(db);

    try {
        if (following) {
            // Unfollow
            batch.delete(followingRef);
            batch.delete(userFollowersRef);
            batch.update(currentUserRef, { followingCount: increment(-1) });
            batch.update(targetUserRef, { followerCount: increment(-1) });

            toast({ title: "Unfollowed", description: `You have unfollowed ${author?.displayName || 'this creator'}.` });
        } else {
           // Follow
           batch.set(followingRef, {
              userId: authorId,
              followedAt: serverTimestamp(),
            });
           batch.set(userFollowersRef, {
              userId: user.uid,
              followedAt: serverTimestamp(),
           });
            batch.update(currentUserRef, { followingCount: increment(1) });
            batch.update(targetUserRef, { followerCount: increment(1) });

          toast({ title: "Followed!", description: `You are now following ${author?.displayName || 'this creator'}.` });
        }
        await batch.commit();
    } catch (e) {
        console.error("Error following user: ", e);
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
  const isFollowing = !!following;

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
            <p className="text-sm text-muted-foreground">{author?.followerCount || 0} {t.topnav.followers}</p> 
          </div>
           {user && user.uid !== authorId && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={loadingFollowing} >
                        {isFollowing ? t.buttons.subscribed : t.buttons.subscribe}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isFollowing ? t.channelDetail.unfollowConfirmation : t.channelDetail.followConfirmation} {author?.displayName || 'this creator'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.channelDetail.confirmationPrompt}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.buttons.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFollow}>{isFollowing ? t.channelDetail.unfollowConfirmation : t.channelDetail.followConfirmation}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
           )}
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleLike} disabled={loadingLike || !user}>
            <Heart className={`mr-2 h-4 w-4 ${like ? 'text-red-500 fill-current' : ''}`} /> {media.likes || 0}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t.buttons.share}
          </Button>
          {user && <SaveToPlaylistDialog mediaId={contentId} />}
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
