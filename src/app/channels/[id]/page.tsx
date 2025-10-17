

'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, increment, collection, query, where, addDoc, serverTimestamp, orderBy, updateDoc } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import { Loader2, Users, CheckCircle, PlusCircle, Video, ListMusic, MessageSquare, Info, Upload, Edit, BarChart3, Heart } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useTransition } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { format } from 'date-fns';
import { ManagePlaylistsDialog } from '@/components/ManagePlaylistsDialog';


const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(2000, "Post must be less than 2000 characters."),
});
type PostFormValues = z.infer<typeof postSchema>;


function CreatePostCard({ channelId }: { channelId: string }) {
    const [user] = useAuthState(useAuth());
    const db = useFirestore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: { content: '' },
    });

    const onSubmit = (data: PostFormValues) => {
        if (!user) return;
        startTransition(() => {
            const postsCollection = collection(db, 'posts');
            const postData = {
                authorId: user.uid,
                content: data.content,
                createdAt: serverTimestamp(),
                contextId: channelId,
                contextType: 'channel' as const,
                likes: 0,
                commentsCount: 0,
            };

            addDoc(postsCollection, postData)
            .then(() => {
                form.reset();
                toast({ title: "Post created successfully!" });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: postsCollection.path,
                    operation: 'create',
                    requestResourceData: postData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        });
    };
    
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">Create a New Post</CardTitle>
                <CardDescription>Share an update with your followers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea {...field} placeholder="What's on your mind?" rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}


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

function PostsTab({ channelId, isOwner }: { channelId: string, isOwner: boolean }) {
    const db = useFirestore();
    const postsQuery = query(
        collection(db, 'posts'), 
        where('authorId', '==', channelId), 
        where('contextType', '==', 'channel'),
        orderBy('createdAt', 'desc')
    );
    const [posts, loading] = useCollectionData(postsQuery, { idField: 'id' });

    if (loading) return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
             {isOwner && <CreatePostCard channelId={channelId} />}
            {posts && posts.length > 0 ? posts.map((post: DocumentData) => (
                <PostCard key={post.id} post={post} />
            )) : (
                 <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Posts Yet</h2>
                    <p className="mt-2 text-muted-foreground">This creator hasn't made any posts on their channel.</p>
                </div>
            )}
        </div>
    );
}

function PlaylistsTab({ channel, isOwner }: { channel: DocumentData, isOwner: boolean }) {
     const db = useFirestore();
     
     const featuredPlaylistIds = channel.featuredPlaylists || [];

     const playlistsQuery = query(collection(db, 'playlists'), where('creatorId', '==', channel.userId), where('isPublic', '==', true));
     const [allPlaylists, loading] = useCollectionData(playlistsQuery, { idField: 'id' });

    if (loading) return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />;
    
    const featuredPlaylists = allPlaylists?.filter(p => featuredPlaylistIds.includes(p.id));

     return (
        <div>
            {isOwner && (
                <div className="mb-6 flex justify-end">
                    <ManagePlaylistsDialog 
                        allPlaylists={allPlaylists || []} 
                        featuredIds={featuredPlaylistIds} 
                        channelId={channel.userId}
                    />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPlaylists && featuredPlaylists.length > 0 ? featuredPlaylists.map((playlist: any) => (
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
                        <h2 className="text-2xl font-semibold text-foreground">No Featured Playlists</h2>
                        <p className="mt-2 text-muted-foreground">This creator hasn't featured any playlists yet.</p>
                        {isOwner && <p className="mt-1 text-sm text-muted-foreground">Click 'Manage Playlists' to add some.</p>}
                    </div>
                )}
            </div>
        </div>
     );
}

function AboutTab({ channel, language }: { channel: DocumentData, language: string }) {
    const description = channel[`description_${language}`] || channel.description_en;
    return (
        <Card>
            <CardHeader>
                <CardTitle>About {channel.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-bold text-lg">{channel.totalViews || 0}</p>
                            <p className="text-sm text-muted-foreground">Total Views</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-bold text-lg">{channel.totalLikes || 0}</p>
                            <p className="text-sm text-muted-foreground">Total Likes</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-bold text-lg">{channel.subscriberCount || 0}</p>
                            <p className="text-sm text-muted-foreground">Subscribers</p>
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { language, t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const channelRef = doc(db, 'channels', channelId);
  const [channel, loadingChannel] = useDocumentData(channelRef);

  const subscriptionRef = user ? doc(db, `users/${user.uid}/subscriptions`, channelId) : undefined;
  const [subscription, loadingSubscription] = useDocumentData(subscriptionRef);
  const isSubscribed = !!subscription;
  const isOwner = user?.uid === channelId;


  const handleSubscribe = async () => {
    if (!user || !channel || !channel.userId) {
      toast({ variant: 'destructive', title: 'You must be logged in to subscribe to a channel.' });
      return;
    }
     if (user.uid === channel.userId) {
        toast({ variant: 'destructive', title: "You cannot subscribe to your own channel." });
        return;
    }

    const userSubscriptionRef = doc(db, `users/${user.uid}/subscriptions`, channelId);
    const channelSubscriberRef = doc(db, `channels/${channelId}/subscribers`, user.uid);
    
    const batch = writeBatch(db);

    if (isSubscribed) {
      batch.delete(userSubscriptionRef);
      batch.delete(channelSubscriberRef);
      batch.update(channelRef, { subscriberCount: increment(-1) });
    } else {
      const subscriptionData = { channelId: channelId, subscribedAt: serverTimestamp() };
      const subscriberData = { userId: user.uid, subscribedAt: serverTimestamp() };
      batch.set(userSubscriptionRef, subscriptionData);
      batch.set(channelSubscriberRef, subscriberData);
      batch.update(channelRef, { subscriberCount: increment(1) });
    }

    batch.commit()
    .then(() => {
        toast({
          title: isSubscribed ? 'Unsubscribed' : 'Subscribed!',
          description: `You have ${isSubscribed ? 'unsubscribed from' : 'subscribed to'} ${channel.name}.`
        });
    })
    .catch((serverError) => {
        const operation = isSubscribed ? 'delete' : 'create';
        const permissionError = new FirestorePermissionError({
            path: userSubscriptionRef.path,
            operation: operation,
            requestResourceData: isSubscribed ? undefined : { channelId: channelId },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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
        <div className="relative h-48 w-full">
            <Image
                src={`https://picsum.photos/seed/${channelId}-banner/1200/400`}
                alt={`${channel.name} banner`}
                data-ai-hint="abstract spiritual background"
                layout="fill"
                objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 -mt-20">
            <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-background bg-secondary mx-auto sm:mx-0">
               <Link href={`/profile/${channelId}`}>
                <Image
                    src={`https://picsum.photos/seed/${channelId}/200/200`}
                    alt={channel.name}
                    data-ai-hint="spiritual teacher"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                />
               </Link>
            </div>
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <CardTitle className="text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                       <Link href={`/profile/${channelId}`}>{channel.name}</Link> <CheckCircle className="h-6 w-6 text-blue-500" />
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        {isOwner && (
                            <Button variant="outline" onClick={() => router.push('/upload')}>
                                <Upload className="mr-2 h-4 w-4" /> Upload Video
                            </Button>
                        )}
                        {user && !isOwner && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant={isSubscribed ? 'secondary' : 'default'} size="lg" disabled={loadingSubscription} >
                                        {loadingSubscription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                            isSubscribed ? <><CheckCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribed}</> : <><PlusCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribe}</>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {isSubscribed ? t.channelDetail.unfollowConfirmation : t.channelDetail.followConfirmation} {channel.name}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t.channelDetail.confirmationPrompt}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t.buttons.cancel}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSubscribe}>{isSubscribed ? t.channelDetail.unfollowConfirmation : t.channelDetail.followConfirmation}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
                <p className="mt-2 text-muted-foreground text-center sm:text-left">{description}</p>
            </div>
          </div>
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
           <PostsTab channelId={channelId} isOwner={isOwner} />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
           <PlaylistsTab channel={channel} isOwner={isOwner} />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutTab channel={channel} language={language} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
