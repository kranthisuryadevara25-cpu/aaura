
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import type { FeedItem } from '@/types/feed';

export function StoryCard({ item }: { item: FeedItem }) {
    const { language, t } = useLanguage();
    const title = item.title?.[language] || item.title?.en;
    const summary = item.description?.[language] || item.description?.en;
    const slug = item.meta?.slug;
    const hint = item.meta?.imageHint;

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <div className="aspect-video relative">
                    <Image
                        src={item.thumbnail || "https://picsum.photos/seed/placeholder/600/400"}
                        alt={title || 'Story'}
                        data-ai-hint={hint}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                </div>
            </CardContent>
            <CardHeader>
                <Badge variant="secondary">{t.feed.storyLabel}</Badge>
                <CardTitle className="text-xl mt-1">{title}</CardTitle>
                <CardDescription className="line-clamp-2">{summary}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/stories/${slug}`}>
                        {t.feed.storyContinue} <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
