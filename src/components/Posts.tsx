
'use client';

import { useTransition, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Comments } from './comments';
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, DocumentData, writeBatch, increment } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(1000, "Post must be less than 1000 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostsProps {
    contextId: string;
    contextType: 'temple' | 'group';
}

function PostCard({ post }: { post: DocumentData }) {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isLiking, startLikeTransition] = useTransition();

  const authorRef = useMemo(() => post.authorId ? doc(db, 'users', post.authorId) : undefined, [db, post.authorId]);
  const [author, authorIsLoading] = useDocumentData(authorRef);
  
  const postRef = useMemo(() => doc(db, 'posts', post.id), [db, post.id]);
  const likeRef = useMemo(() => user ? doc(db, `posts/${post.id}/likes/${user.uid}`) : undefined, [db, post.id, user]);
  
  const [likeDoc, likeLoading] = useDocumentData(likeRef);
  const isLiked = !!likeDoc;

  const [showComments, setShowComments] = useState(false);
  
  const handleLike = () => {
    if (!user || !postRef || !likeRef) {
        toast({ variant: "destructive", title: "Please log in to like posts." });
        return;
    }
    startLikeTransition(() => {
        const batch = writeBatch(db);
        const likeData = { createdAt: serverTimestamp() };

        if (isLiked) {
            batch.delete(likeRef);
            batch.update(postRef, { likes: increment(-1) });
        } else {
            batch.set(likeRef, likeData);
            batch.update(postRef, { likes: increment(1) });
        }
        
        batch.commit().catch(async (serverError) => {
            const operation = isLiked ? 'delete' : 'create';
            const permissionError = new FirestorePermissionError({
                path: likeRef.path,
                operation: operation,
                requestResourceData: operation === 'create' ? likeData : undefined,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    });
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
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
         <Button variant="ghost" size="sm" onClick={handleLike} disabled={!user || isLiking || likeLoading}>
            <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'text-blue-500 fill-current' : ''}`} /> 
            {isLiking || likeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : post.likes || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments(prev => !prev)}>
            <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount || 0} comments
        </Button>
      </CardFooter>
      {showComments && (
        <CardContent>
            <Comments contentId={post.id} contentType="post" />
        </CardContent>
      )}
    </Card>
  );
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
        
        try {
            await addDoc(postsCollection, newPost);
            form.reset();
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
    const postsQuery = useMemo(() => query(
        collection(db, 'posts'),
        where('contextId', '==', contextId),
        where('contextType', '==', contextType),
        orderBy('createdAt', 'desc')
    ), [db, contextId, contextType]);
    
    const [posts, loadingPosts] = useCollectionData(postsQuery, { idField: 'id' });

    return (
        <div>
            <CreatePost contextId={contextId} contextType={contextType} onPostCreated={() => {}} />
            {loadingPosts ? <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                <div className="space-y-6">
                    {posts && posts.length > 0 ? (
                        posts.map((post, index) => <PostCard key={post.id || index} post={post} />)
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
