
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, serverTimestamp, query, orderBy, addDoc, updateDoc, doc, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Send, ThumbsUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(500, "Post must be less than 500 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

export function CreatePost() {
  const [user] = useAuthState(useAuth());
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();
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
        const postsCollection = collection(db, 'posts');
        await addDoc(postsCollection, {
          authorId: user.uid,
          content: data.content,
          createdAt: serverTimestamp(),
          likes: 0,
          commentsCount: 0,
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
    return null; // Don't show the create post form if user is not logged in.
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{t.forum.createPostTitle}</h2>
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
                      placeholder={t.forum.createPostPlaceholder}
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
              {t.buttons.post}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export function PostCard({ post }: { post: any; }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  
  const authorRef = post.authorId ? doc(db, 'users', post.authorId) : undefined;
  const [author] = useDocumentData(authorRef);
  
  const postRef = doc(db, 'posts', post.id);
  const likeRef = user ? doc(db, `posts/${post.id}/likes/${user.uid}`) : undefined;
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
  
  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const postUrl = `${window.location.origin}/forum/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ title: "Link Copied!", description: "The post link has been copied to your clipboard." });
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={author?.photoURL} />
          <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{author?.displayName || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">@{author?.email || 'user'}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
         <Button variant="ghost" size="sm" onClick={handleLike} disabled={!user || isLikeLoading}>
            <ThumbsUp className={`mr-2 h-4 w-4 ${like ? 'text-blue-500 fill-current' : ''}`} /> {post.likes || 0}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/forum/${post.id}`}>
            <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount || 0}
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t.buttons.share}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ForumPage() {
  const { t } = useLanguage();
  const db = useFirestore();
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const [posts, postsLoading] = useCollectionData(postsQuery, { idField: 'id' });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
            <MessageCircle className="h-10 w-10" /> {t.forum.title}
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t.forum.description}
          </p>
        </div>

        <div className="mb-8">
            <CreatePost />
        </div>

        <div className="space-y-6">
          {postsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t.forum.noPosts}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
