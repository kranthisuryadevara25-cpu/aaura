
'use client';

import { useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Header } from '@/app/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(500, "Post must be less than 500 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

function PostCard({ post, author }: { post: any; author: any }) {
  const { t } = useLanguage();
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
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">@{author?.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" asChild>
          <Link href={`/forum/${post.id}`}>
            <MessageCircle className="mr-2 h-4 w-4" /> {t.forum.viewDiscussion}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ForumPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, isLoading: postsLoading } = useCollection(postsQuery);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: usersData, isLoading: usersLoading } = useCollection(usersQuery);

  const usersMap = useMemo(() => {
    if (!usersData) return new Map();
    return new Map(usersData.map(u => [u.id, u]));
  }, [usersData]);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = (data: PostFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }
    startTransition(async () => {
      try {
        const postsCollection = collection(firestore, 'posts');
        await addDocumentNonBlocking(postsCollection, {
          authorId: user.uid,
          content: data.content,
          createdAt: serverTimestamp(),
          likes: 0,
        });
        form.reset();
        toast({ title: 'Post created successfully!' });
      } catch (error) {
        console.error("Error creating post:", error);
        toast({ variant: 'destructive', title: 'Failed to create post.' });
      }
    });
  };

  const isLoading = postsLoading || usersLoading;

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
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                    <MessageCircle className="h-10 w-10" /> {t.forum.title}
                  </h1>
                  <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    {t.forum.description}
                  </p>
                </div>

                {user && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>{t.forum.createPostTitle}</CardTitle>
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
                )}

                <div className="space-y-6">
                  {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : posts && posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard key={post.id} post={post} author={usersMap.get(post.authorId)} />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">{t.forum.noPosts}</p>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
