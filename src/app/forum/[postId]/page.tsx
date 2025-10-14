
'use client';

import { useParams, notFound } from 'next/navigation';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, collection, query, orderBy, serverTimestamp, addDoc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, ThumbsUp, Send, Users, CheckCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Comments } from '@/components/comments';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(1000, "Post must be less than 1000 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

function CreatePost({ groupId }: { groupId: string }) {
  const [user] = useAuthState(useAuth());
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const db = useFirestore();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = (data: PostFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }
    startTransition(async () => {
      try {
        const postsCollection = collection(db, 'groups', groupId, 'posts');
        await addDoc(postsCollection, {
          authorId: user.uid,
          content: data.content,
          createdAt: serverTimestamp(),
          likes: 0,
          commentsCount: 0,
          groupId: groupId,
        });
        form.reset();
        toast({ title: 'Post created successfully!' });
      } catch (error) {
        console.error("Error creating post:", error);
        toast({ variant: 'destructive', title: 'Failed to create post.' });
      }
    });
  };

  if (!user) {
    return null; 
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Create a New Post</h2>
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
                    <Textarea
                      placeholder="Share your thoughts or ask a question..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Post
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


function PostCard({ post }: { post: any; }) {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);

  if (!post || !post.id) {
    return null;
  }
  
  const authorRef = post.authorId ? doc(db, 'users', post.authorId) : undefined;
  const [author, authorIsLoading] = useDocumentData(authorRef);
  
  // Note: Firestore security rules should handle authorization
  const postRef = doc(db, 'groups', post.groupId, 'posts', post.id);
  const likeRef = user ? doc(db, `groups/${post.groupId}/posts/${post.id}/likes/${user.uid}`) : undefined;
  const [like, isLikeLoading] = useDocumentData(likeRef);
  
  const handleLike = async () => {
    if (!user || !likeRef) {
      toast({ variant: 'destructive', title: "You must be logged in to like a post." });
      return;
    }

    try {
      if (like) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
      } else {
        await setDoc(likeRef, { userId: user.uid });
        await updateDoc(postRef, { likes: increment(1) });
      }
    } catch (error) {
      console.error("Error liking post: ", error)
      toast({ variant: 'destructive', title: 'Something went wrong.' });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {authorIsLoading ? <div className="h-10 w-10 rounded-full bg-muted animate-pulse" /> : (
            <Avatar>
            <AvatarImage src={author?.photoURL} />
            <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
        )}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{author?.displayName || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
         <Button variant="ghost" size="sm" onClick={handleLike} disabled={!user || isLikeLoading}>
            <ThumbsUp className={`mr-2 h-4 w-4 ${like ? 'text-blue-500 fill-current' : ''}`} /> {post.likes || 0}
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
            <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount || 0} comments
        </div>
      </CardFooter>
      <CardContent>
          <Separator className="my-4" />
          <Comments contentId={post.id} contentType="post" parentCollectionPath={`groups/${post.groupId}/posts`} />
      </CardContent>
    </Card>
  );
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.postId as string; // Route uses [postId] but it's the groupId
  const db = useFirestore();

  const groupRef = doc(db, 'groups', groupId);
  const [group, groupLoading] = useDocumentData(groupRef);

  const postsQuery = query(collection(db, 'groups', groupId, 'posts'), orderBy('createdAt', 'desc'));
  const [posts, postsLoading] = useCollectionData(postsQuery, { idField: 'id' });
  
  if (groupLoading || postsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!groupLoading && !group) {
    notFound();
  }

  if (!group) {
      return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-primary">{group.name}</h1>
            <p className="mt-2 text-muted-foreground">{group.description}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {group.memberCount || 0} members
            </div>
        </div>
        
        <div className="mb-8">
          <CreatePost groupId={groupId} />
        </div>

        <div className="space-y-6">
            {posts && posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No posts in this group yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first one to start a discussion!</p>
                </div>
            )}
        </div>

      </div>
    </main>
  );
}
