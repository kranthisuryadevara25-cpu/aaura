
'use client';

import { useTransition, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, DocumentData } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { PostCard } from '@/components/PostCard';


const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(1000, "Post must be less than 1000 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostsProps {
    contextId: string;
    contextType: 'temple' | 'group';
}

function CreatePost({ contextId, contextType, onPostCreated }: { contextId: string, contextType: 'temple' | 'group', onPostCreated: (newPost: any) => void }) {
  const [user] = useAuthState(useAuth());
  const db = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
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
        const postsCollection = collection(db, 'posts');
        const newPost = {
            authorId: user.uid,
            content: data.content,
            createdAt: serverTimestamp(),
            contextId: contextId,
            contextType: contextType,
            likes: 0,
            commentsCount: 0,
        };
        
        const optimisticPost = {
          ...newPost,
          id: `optimistic-${Date.now()}`,
          authorId: user.uid,
          createdAt: { toDate: () => new Date() }, // Mock timestamp for immediate UI update
        };
        onPostCreated(optimisticPost);
        form.reset();

        try {
            await addDoc(postsCollection, newPost);
            toast({ title: 'Post created successfully!' });
        } catch (error) {
             const permissionError = new FirestorePermissionError({
                path: postsCollection.path,
                operation: 'create',
                requestResourceData: newPost,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
  };

  if (!user) {
    return null; 
  }

  return (
    <Card className="mb-8">
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
                      placeholder="Share an update, ask a question, or discuss your experience..."
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

export function Posts({ contextId, contextType }: PostsProps) {
    const db = useFirestore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const postsQuery = useMemo(() => {
        if (!db || !isClient) return undefined;
        return query(
            collection(db, 'posts'),
            where('contextId', '==', contextId),
            where('contextType', '==', contextType),
            orderBy('createdAt', 'desc')
        )
    }, [db, contextId, contextType, isClient]);
    
    const [fetchedPosts, loadingPosts] = useCollectionData(postsQuery, { idField: 'id' });
    const [optimisticPosts, setOptimisticPosts] = useState<DocumentData[]>([]);

    useEffect(() => {
        if(fetchedPosts) {
            // Combine optimistic posts with fetched posts, ensuring no duplicates
             setOptimisticPosts(prev => {
                const fetchedIds = new Set(fetchedPosts.map(p => p.id));
                const optimisticOnly = prev.filter(p => p.id.startsWith('optimistic-') && !fetchedIds.has(p.id));
                return [...optimisticOnly, ...fetchedPosts];
            });
        }
    }, [fetchedPosts]);

    const handlePostCreated = (newPost: DocumentData) => {
        setOptimisticPosts(prevPosts => [newPost, ...prevPosts]);
    };

    if (!isClient) {
        return <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div>
            <CreatePost contextId={contextId} contextType={contextType} onPostCreated={handlePostCreated} />
            {loadingPosts && optimisticPosts.length === 0 ? <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                <div className="space-y-6">
                    {optimisticPosts && optimisticPosts.length > 0 ? (
                        optimisticPosts.map((post) => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No posts here yet.</p>
                            <p className="text-sm text-muted-foreground mt-1">Be the first one to start a discussion!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
