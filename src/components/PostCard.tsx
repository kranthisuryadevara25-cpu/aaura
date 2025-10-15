
'use client';

import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { doc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

export function PostCard({ post }: { post: DocumentData; }) {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  
  const authorRef = doc(db, 'users', post.authorId);
  const [author, authorIsLoading] = useDocumentData(authorRef);
  
  // MOCK: Like state is local for now. In a real app, this would be a Firestore read/write.
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  
  const handleLike = () => {
    if (!user) {
      toast({ variant: 'destructive', title: "You must be logged in to like a post." });
      return;
    }
    // This is a mock implementation. A real one would update Firestore.
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
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
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
        <div className="flex items-center text-sm text-muted-foreground">
            <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount || 0} comments
        </div>
      </CardFooter>
    </Card>
  );
}

    