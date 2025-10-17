
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Brain, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { getManifestationBySlug } from '@/lib/manifestations';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Comments } from '@/components/comments';
import { doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import Link from 'next/link';

export default function ManifestationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  
  // This is mock data and should be replaced with a firestore query
  const postData = getManifestationBySlug(slug);

  // In a real app, you would fetch the post by slug from Firestore.
  const postRef = doc(db, "manifestations", postData?.id || "---");
  const [post, postLoading] = useDocumentData(postRef);

  const likeRef = user ? doc(db, `manifestations/${postData?.id}/likes/${user.uid}`) : undefined;
  const [likeDoc, likeLoading] = useDocumentData(likeRef);
  const isLiked = !!likeDoc;

  const [isLiking, startLikeTransition] = useTransition();

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
            batch.update(postRef, { likesCount: increment(-1) });
        } else {
            batch.set(likeRef, likeData);
            batch.update(postRef, { likesCount: increment(1) });
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

  if (postLoading) {
      return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  if (!postData) {
    notFound();
  }

  const currentPostData = post || postData;
  
  const author = { displayName: 'User ' + currentPostData.authorId.slice(0, 4), photoURL: `https://picsum.photos/seed/${currentPostData.authorId}/100/100` };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {currentPostData.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">{currentPostData.title}</h1>
                <div className="mt-4 flex items-center gap-4">
                     <Link href={`/profile/${currentPostData.authorId}`} className="group">
                        <Avatar>
                            <AvatarImage src={author.photoURL} />
                            <AvatarFallback>{author.displayName[0]}</AvatarFallback>
                        </Avatar>
                     </Link>
                     <div>
                        <Link href={`/profile/${currentPostData.authorId}`} className="group">
                            <p className="font-semibold text-foreground group-hover:text-primary">{author.displayName}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Shared {formatDistanceToNow(new Date(currentPostData.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </header>

            {currentPostData.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                    <Image
                        src={currentPostData.imageUrl}
                        alt={currentPostData.title}
                        data-ai-hint={currentPostData.imageHint}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            
            <div className="space-y-8">
                 <Card className="bg-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary"><Brain /> The Technique</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90 whitespace-pre-wrap">{currentPostData.technique}</p>
                    </CardContent>
                </Card>

                {currentPostData.results && (
                     <Card className="bg-transparent border-green-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-green-600">The Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="text-foreground/90 italic border-l-4 border-green-500 pl-4">
                                "{currentPostData.results}"
                            </blockquote>
                        </CardContent>
                    </Card>
                )}
            </div>
            
             <Separator className="my-8" />
             
            <div className="flex items-center gap-4">
                <Button onClick={handleLike} variant={isLiked ? "default" : "outline"} disabled={!user || isLiking || likeLoading}>
                    {isLiking || likeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />} 
                    {isLiked ? 'Liked' : 'Like'} ({currentPostData.likesCount || 0})
                </Button>
            </div>
            
            <Separator className="my-8" />

            <Comments contentId={currentPostData.id} contentType="manifestation" />

        </article>
    </main>
  );
}
