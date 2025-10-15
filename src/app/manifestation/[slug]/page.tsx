
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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Comments } from '@/components/comments';

export default function ManifestationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  
  const post = getManifestationBySlug(slug);

  // MOCK State for interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);

  const handleLike = () => {
    if (!user) {
        toast({ variant: "destructive", title: "Please log in to like posts." });
        return;
    }
    // Mock functionality
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };


  if (!post) {
    notFound();
  }
  
  const author = { displayName: 'User ' + post.authorId.slice(0, 4), photoURL: `https://picsum.photos/seed/${post.authorId}/100/100` };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">{post.title}</h1>
                <div className="mt-4 flex items-center gap-4">
                     <Avatar>
                        <AvatarImage src={author.photoURL} />
                        <AvatarFallback>{author.displayName[0]}</AvatarFallback>
                    </Avatar>
                     <div>
                        <p className="font-semibold text-foreground">{author.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                            Shared {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </header>

            {post.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        data-ai-hint={post.imageHint}
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
                        <p className="text-foreground/90 whitespace-pre-wrap">{post.technique}</p>
                    </CardContent>
                </Card>

                {post.results && (
                     <Card className="bg-transparent border-green-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-green-600">The Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="text-foreground/90 italic border-l-4 border-green-500 pl-4">
                                "{post.results}"
                            </blockquote>
                        </CardContent>
                    </Card>
                )}
            </div>
            
             <Separator className="my-8" />
             
            <div className="flex items-center gap-4">
                <Button onClick={handleLike} variant={isLiked ? "default" : "outline"} disabled={!user}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> 
                    {isLiked ? 'Liked' : 'Like'} ({likeCount})
                </Button>
            </div>
            
            <Separator className="my-8" />

            <Comments contentId={post.id} contentType="post" />

        </article>
    </main>
  );
}

