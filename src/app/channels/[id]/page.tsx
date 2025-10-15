
'use client';

import { useParams, notFound } from 'next/navigation';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, increment, collection, query, where } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import { Loader2, Users, CheckCircle, PlusCircle, Video, ListMusic, MessageSquare, Info } from 'lucide-react';
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
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';

function VideosTab({ channelId }: { channelId: string }) {
    const db = useFirestore();
    const { language } = useLanguage();
    const mediaQuery = query(collection(db, 'media'), where('userId', '==', channelId), where('status', '==', 'approved'));
    const [media, loading] = useCollectionData(mediaQuery, { idField: 'id' });

    if (loading) return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media && media.length > 0 ? media.map((item: any) => {
                const title = item[`title_${language}`] || item.title_en;
                return (
                    <Link href={`/watch/${item.id}`} key={item.id} className="group">
                        <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
                            <CardContent className="p-0 mb-3">
                                <div className="aspect-video relative rounded-t-lg overflow-hidden">
                                    <Image
                                        src={item.thumbnailUrl}
                                        alt={title}
                                        fill
                                        className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            </CardContent>
                            <CardHeader className="p-4 pt-0">
                                <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                                    {title}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                );
            }) : (
                <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Videos Yet</h2>
                    <p className="mt-2 text-muted-foreground">This creator hasn't uploaded any videos.</p>
                </div>
            )}
        </div>
    );
}

function PostsTab({ channelId }: { channelId: string }) {
    const db = useFirestore();
    const postsQuery = query(collection(db, 'posts'), where('authorId', '==', channelId));
    const [posts, loading] = useCollectionData(postsQuery, { idField: 'id' });

    if (loading) return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {posts && posts.length > 0 ? posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
            )) : (
                 <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Posts Yet</h2>
                    <p className="mt-2 text-muted-foreground">This creator hasn't made any posts.</p>
                </div>
            )}
        </div>
    );
}

function PlaylistsTab({ channelId }: { channelId: string }) {
     const db = useFirestore();
     const playlistsQuery = query(collection(db, 'playlists'), where('creatorId', '==', channelId), where('isPublic', '==', true));
     const [playlists, loading] = useCollectionData(playlistsQuery, { idField: 'id' });

    if (loading) return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;

     return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {playlists && playlists.length > 0 ? playlists.map((playlist: any) => (
                <Link href={`/playlists/${playlist.id}`} key={playlist.id} className="group">
                    <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 h-full flex flex-col">
                        <div className="relative aspect-video bg-secondary">
                            <Image src={`https://picsum.photos/seed/${playlist.id}/600/400`} alt={playlist.title} layout="fill" className="object-cover" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                                {playlist.title}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
             )) : (
                 <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Playlists Yet</h2>
                    <p className="mt-2 text-muted-foreground">This creator hasn't created any public playlists.</p>
                </div>
             )}
         </div>
     );
}

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
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-20">
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
                                isFollowing ? <><CheckCircle className="mr-2 h-4 w-4" /> Subscribed</> : <><PlusCircle className="mr-2 h-4 w-4" /> Subscribe</>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos"><Video className="mr-2 h-4 w-4" /> Videos</TabsTrigger>
          <TabsTrigger value="posts"><MessageSquare className="mr-2 h-4 w-4" /> Posts</TabsTrigger>
          <TabsTrigger value="playlists"><ListMusic className="mr-2 h-4 w-4" /> Playlists</TabsTrigger>
          <TabsTrigger value="about"><Info className="mr-2 h-4 w-4" /> About</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
          <VideosTab channelId={channelId} />
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
           <PostsTab channelId={channelId} />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
           <PlaylistsTab channelId={channelId} />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
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

    