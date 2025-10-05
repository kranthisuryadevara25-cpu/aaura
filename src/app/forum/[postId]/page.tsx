
'use client';

import { useParams, notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import { Comments } from '@/components/comments';


export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;

  const postRef = doc(db, 'posts', postId);
  const [post, postLoading] = useDocumentData(postRef);

  const authorRef = post ? doc(db, 'users', post.authorId) : undefined;
  const [author, authorLoading] = useDocumentData(authorRef);
  
  const isLoading = postLoading || authorLoading;

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
        
        <Comments contentId={postId} contentType="post" />

      </div>
    </main>
  );
}
