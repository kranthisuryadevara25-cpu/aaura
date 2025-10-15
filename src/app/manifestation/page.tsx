
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, PlusCircle, ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { manifestations } from '@/lib/manifestations';
import type { Manifestation } from '@/lib/manifestations';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function ManifestationCard({ post }: { post: Manifestation }) {
    // MOCK: In a real app, this would fetch the author details
    const author = { displayName: 'User ' + post.authorId.slice(0, 4), photoURL: `https://picsum.photos/seed/${post.authorId}/100/100` };
    
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
                        <ThumbsUp className="w-4 h-4" /> {post.likes} Likes
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                        <MessageSquare className="w-4 h-4" /> {post.comments} Comments
                    </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/manifestation/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function ManifestationPage() {
    const [posts, setPosts] = useState(manifestations);
    
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map(post => (
                    <ManifestationCard key={post.id} post={post} />
                ))}
            </div>
        </main>
    );
}
