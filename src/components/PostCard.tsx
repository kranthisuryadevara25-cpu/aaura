
'use client';

import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransition, useState, useMemo, useEffect } from 'react';
import { doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Comments } from '@/components/comments';
import { ClientOnlyTime } from '@/components/ClientOnlyTime';
import { Separator } from './ui/separator';


const AuthorAvatar = ({ userId }: { userId: string }) => {
  const db = useFirestore();
  const authorRef = userId ? doc(db, 'users', userId) : undefined;
  const [author, loading] = useDocumentData(authorRef);

  if (loading || !author) {
    return (
        <Link href={`/profile/${userId}`} className="w-10 h-10 shrink-0">
            <Skeleton className="h-10 w-10 rounded-full" />
        </Link>
    );
  }

  return (
     <Link href={`/profile/${userId}`} className="w-10 h-10 shrink-0">
        <Avatar>
            <AvatarImage src={author.photoURL} />
            <AvatarFallback>{author.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
     </Link>
  )
}

export function PostCard({ post }: { post: DocumentData; }) {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isLiking, startLikeTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const authorId = post.authorId;
  const authorRef = useMemo(() => authorId && db ? doc(db, 'users', authorId) : undefined, [db, authorId]);
  const [author, authorIsLoading] = useDocumentData(authorRef);
  
  const postRef = useMemo(() => {
    if (!post.id || !db) return undefined;
    return doc(db, 'posts', post.id);
  }, [db, post.id]);

  const likeRef = useMemo(() => (user && post.id && db) ? doc(db, `posts/${post.id}/likes/${user.uid}`) : undefined, [db, post.id, user]);
  const [likeDoc, likeLoading] = useDocumentData(likeRef);
  
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(!!likeDoc);
  }, [likeDoc]);


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
  
  if (!post.id) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        </CardHeader>
        <CardContent>
           <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  const createdAtDate = post.createdAt?.toDate ? post.createdAt.toDate() : undefined;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {authorIsLoading ? <Skeleton className="h-10 w-10 rounded-full" /> : (
            <Link href={`/profile/${post.authorId}`}>
              <Avatar>
                <AvatarImage src={author?.photoURL} />
                <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
        )}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <Link href={`/profile/${post.authorId}`} className="group">
              <p className="font-semibold group-hover:text-primary">{author?.displayName || 'Anonymous'}</p>
            </Link>
            <p className="text-xs text-muted-foreground">
              <ClientOnlyTime date={createdAtDate} />
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      {isClient && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="ghost" size="sm" onClick={handleLike} disabled={!user || isLiking || likeLoading}>
              <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'text-blue-500 fill-current' : ''}`} /> 
              {isLiking || likeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : post.likes || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5">
              <MessageCircle className="mr-2 h-4 w-4" /> {post.commentsCount || 0} comments
          </Button>
        </CardFooter>
      )}
      {showComments && (
        <CardContent>
            <Separator className="mb-4" />
            <Comments contentId={post.id} contentType="post" />
        </CardContent>
      )}
    </Card>
  );
}
