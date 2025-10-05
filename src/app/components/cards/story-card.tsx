'use client';

import { Story } from '@/lib/stories';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function StoryCard({ story }: { story: Story & { id: string } }) {
    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <div className="aspect-video relative">
                    <Image
                        src={story.image.url}
                        alt={story.title}
                        data-ai-hint={story.image.hint}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                </div>
            </CardContent>
            <CardHeader>
                <Badge variant="secondary">Mythological Story</Badge>
                <CardTitle className="text-xl mt-1">{story.title}</CardTitle>
                <CardDescription className="line-clamp-2">{story.summary}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/stories/${story.slug}`}>
                        Continue Reading <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
