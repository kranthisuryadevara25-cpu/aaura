
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, PlusCircle, ThumbsUp, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Manifestation } from '@/lib/manifestations';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';


function ManifestationCard({ post }: { post: Manifestation }) {
    const author = { displayName: 'User ' + post.userId.slice(0, 4), photoURL: `https://picsum.photos/seed/${post.userId}/100/100` };
    
    return (
        <Card className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
             <CardHeader className="flex-row gap-3 items-center">
                <Avatar>
                    <AvatarImage src={author.photoURL} />
                    <AvatarFallback>{author.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">{author.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                        Shared {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.technique}</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/30 p-4">
                 <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-xs">
                        <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0} Likes
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                        <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0} Comments
                    </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/manifestation/${post.id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function ManifestationPage() {
    const db = useFirestore();
    const manifestationsQuery = useMemo(() => query(collection(db, 'manifestations'), orderBy('createdAt', 'desc')), [db]);
    const [posts, isLoading] = useCollectionData(manifestationsQuery);
    
    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                        <Brain className="h-10 w-10" /> Manifestation Hub
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                        Share and discover techniques to attract your desires and shape your reality.
                    </p>
                </div>
                 <Button asChild size="lg">
                    <Link href="/manifestation/create">
                        <PlusCircle className="mr-2" />
                        Share Your Manifestation
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {posts.map(post => (
                        <ManifestationCard key={post.id} post={post as Manifestation} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Brain className="mx-auto h-24 w-24 text-muted-foreground/50" />
                    <h2 className="mt-6 text-2xl font-semibold text-foreground">Be the First to Share</h2>
                    <p className="mt-2 text-muted-foreground">
                        No manifestations have been shared yet. Start the movement!
                    </p>
                </div>
            )}
        </main>
    );
}
