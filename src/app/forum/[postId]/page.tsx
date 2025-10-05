
'use client';

import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Header } from '@/app/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});

type CommentFormValues = z.infer<typeof commentSchema>;

function CommentCard({ comment, author }: { comment: any; author: any }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author?.photoURL} />
        <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="w-full rounded-lg bg-secondary p-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{author?.displayName || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">
            {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
          </p>
        </div>
        <p className="text-sm mt-1">{comment.text}</p>
      </div>
    </div>
  );
}


export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const postRef = useMemo(() => {
    if (!firestore || !postId) return null;
    return doc(firestore, 'posts', postId);
  }, [firestore, postId]);
  const { data: post, isLoading: postLoading } = useDoc(postRef);

  const authorRef = useMemo(() => {
    if (!firestore || !post?.authorId) return null;
    return doc(firestore, 'users', post.authorId);
  }, [firestore, post]);
  const { data: author, isLoading: authorLoading } = useDoc(authorRef);
  
  const commentsQuery = useMemo(() => {
    if (!firestore || !postId) return null;
    return query(collection(firestore, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  }, [firestore, postId]);
  const { data: comments, isLoading: commentsLoading } = useCollection(commentsQuery);
  
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: usersData, isLoading: usersLoading } = useCollection(usersQuery);

  const usersMap = useMemo(() => {
    if (!usersData) return new Map();
    return new Map(usersData.map(u => [u.id, u]));
  }, [usersData]);


  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const onSubmitComment = (data: CommentFormValues) => {
    if (!user || !firestore || !postId) {
      toast({ variant: 'destructive', title: 'You must be logged in to comment.' });
      return;
    }
    startTransition(async () => {
      try {
        const commentsCollection = collection(firestore, 'posts', postId, 'comments');
        await addDocumentNonBlocking(commentsCollection, {
          postId: postId,
          authorId: user.uid,
          text: data.text,
          createdAt: serverTimestamp(),
        });
        form.reset();
        toast({ title: 'Comment posted!' });
      } catch (error) {
        console.error("Error creating comment:", error);
        toast({ variant: 'destructive', title: 'Failed to post comment.' });
      }
    });
  };

  const isLoading = postLoading || authorLoading || commentsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
            <Navigation />
          </Sidebar>
          <SidebarInset>
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Avatar>
                      <AvatarImage src={author?.photoURL} />
                      <AvatarFallback>{author?.displayName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                       <p className="font-semibold">{author?.displayName || 'Anonymous'}</p>
                       <p className="text-xs text-muted-foreground">
                        {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                       </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                </Card>

                <Separator className="my-8" />
                
                <h2 className="text-2xl font-bold mb-4">Discussion</h2>

                <div className="space-y-6 mb-8">
                  {comments && comments.length > 0 ? (
                    comments.map(comment => (
                      <CommentCard key={comment.id} comment={comment} author={usersMap.get(comment.authorId)} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to reply!</p>
                  )}
                </div>

                {user && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitComment)} className="flex items-start gap-4">
                      <Avatar className="h-9 w-9 mt-1">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Textarea
                                placeholder="Write a comment..."
                                className="resize-none"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isPending} size="icon">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </Form>
                )}

              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
