
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, ThumbsUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPostsByTempleId, type TemplePost } from '@/lib/temple-posts';
import { getPostsByGroupId, type Post as GroupPost } from '@/lib/posts';
import { Comments } from './comments';

const postSchema = z.object({
  content: z.string().min(10, "Post must be at least 10 characters.").max(1000, "Post must be less than 1000 characters."),
});

type PostFormValues = z.infer<typeof postSchema>;

type AnyPost = TemplePost | GroupPost;

interface PostsProps {
    contextId: string;
    contextType: 'temple' | 'group';
}

function PostCard({ post }: { post: AnyPost }) {
  const { toast } = useToast();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  // MOCK: In a real app, this would fetch the author details
  const author = { displayName: 'User ' + post.authorId.slice(0, 4), photoURL: `https://picsum.photos/seed/${post.authorId}/100/100` };
  const authorIsLoading = false;
  
  // MOCK: Like state is local
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  
  const handleLike = () => {
    if (!user) {
      toast({ variant: 'destructive', title: "You must be logged in to like a post." });
      return;
    }
    if (isLiked) {
        setLikeCount(prev => prev - 1);
    } else {
        setLikeCount(prev => prev + 1);
    }
    setIsLiked(prev => !prev);
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
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
         <Button variant="ghost" size="sm" onClick={handleLike} disabled={!user}>
            <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'text-blue-500 fill-current' : ''}`} /> {likeCount}
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
        // Mock post creation
        const newPost: AnyPost = {
            id: `post-${Date.now()}`,
            authorId: user.uid,
            content: data.content,
            createdAt: new Date().toISOString(),
            likes: 0,
            commentsCount: 0,
            ...(contextType === 'temple' && { templeId: contextId }),
            ...(contextType === 'group' && { groupId: contextId }),
        };
        onPostCreated(newPost);
        form.reset();
        toast({ title: 'Post created successfully! (Mock)' });
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
    const [posts, setPosts] = useState<AnyPost[]>([]);
    
    useEffect(() => {
        if (contextType === 'temple') {
            setPosts(getPostsByTempleId(contextId));
        } else if (contextType === 'group') {
            setPosts(getPostsByGroupId(contextId));
        }
    }, [contextId, contextType]);

    const handlePostCreated = (newPost: AnyPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    }
  
    return (
        <div>
            <CreatePost contextId={contextId} contextType={contextType} onPostCreated={handlePostCreated} />
            <div className="space-y-6">
                {posts && posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No posts here yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">Be the first one to start a discussion!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
