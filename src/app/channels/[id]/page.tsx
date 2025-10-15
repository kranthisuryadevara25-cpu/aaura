
'use client';

import { useParams, notFound } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import { Loader2, Users, CheckCircle, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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


export default function ChannelDetailPage() {
  const params = useParams();
  const channelId = params.id as string;
  const { language, t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const channelRef = doc(db, 'channels', channelId);
  const [channel, loadingChannel] = useDocumentData(channelRef);

  const followingRef = user ? doc(db, `users/${user.uid}/following`, channelId) : undefined;
  const [following, loadingFollowing] = useDocumentData(followingRef);
  const isFollowing = !!following;

  const handleFollow = async () => {
    if (!user || !channel || !channel.userId) {
      toast({ variant: 'destructive', title: 'You must be logged in to follow a channel.' });
      return;
    }
     if (user.uid === channel.userId) {
        toast({ variant: 'destructive', title: "You cannot follow your own channel." });
        return;
    }

    const currentUserRef = doc(db, 'users', user.uid);
    const targetUserRef = doc(db, 'users', channel.userId);
    const userFollowingRef = doc(db, `users/${user.uid}/following`, channelId);
    const targetFollowerRef = doc(db, `users/${channel.userId}/followers`, user.uid);
    
    const batch = writeBatch(db);

    try {
      if (isFollowing) {
        batch.delete(userFollowingRef);
        batch.delete(targetFollowerRef);
        batch.update(currentUserRef, { followingCount: increment(-1) });
        batch.update(targetUserRef, { followerCount: increment(-1) });
        await batch.commit();
        toast({ title: 'Unfollowed', description: `You have unfollowed ${channel.name}.` });
      } else {
        batch.set(userFollowingRef, { userId: channelId, followedAt: new Date() });
        batch.set(targetFollowerRef, { userId: user.uid, followedAt: new Date() });
        batch.update(currentUserRef, { followingCount: increment(1) });
        batch.update(targetUserRef, { followerCount: increment(1) });
        await batch.commit();
        toast({ title: 'Followed!', description: `You are now following ${channel.name}.` });
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  };

  if (loadingChannel) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!channel) {
    notFound();
  }

  const description = channel[`description_${language}`] || channel.description_en;

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full bg-secondary">
          <Image
            src={`https://picsum.photos/seed/${channelId}-banner/1200/400`}
            alt={`${channel.name} banner`}
            data-ai-hint="abstract spiritual background"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6 -mt-20">
            <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-background bg-secondary">
              <Image
                src={`https://picsum.photos/seed/${channelId}/200/200`}
                alt={channel.name}
                data-ai-hint="spiritual teacher"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                {channel.name} <CheckCircle className="h-6 w-6 text-blue-500" />
              </CardTitle>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {channel.followerCount || 0} Followers
                </div>
              </div>
            </div>
             {user && user.uid !== channel.userId && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant={isFollowing ? 'secondary' : 'default'} size="lg" disabled={loadingFollowing} >
                            {loadingFollowing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                isFollowing ? <><CheckCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribed}</> : <><PlusCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribe}</>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isFollowing ? "Unfollow" : "Follow"} {channel.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                You can always change your mind later.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFollow}>{isFollowing ? 'Unfollow' : 'Follow'}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
          </div>
          <p className="mt-6 text-center sm:text-left text-muted-foreground">{description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="videos" className="mt-8">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-4">
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
            <p className="mt-2 text-muted-foreground">This creator's videos will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="posts" className="mt-4">
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
             <p className="mt-2 text-muted-foreground">Posts by this creator will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="playlists" className="mt-4">
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
             <p className="mt-2 text-muted-foreground">Playlists curated by this creator will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="about" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>About {channel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{description}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
