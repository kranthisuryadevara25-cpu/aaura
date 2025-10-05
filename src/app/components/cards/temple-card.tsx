
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import type { FeedItem } from '@/types/feed';

export function TempleCard({ item }: { item: FeedItem }) {
    const { language, t } = useLanguage();
    const name = item.title?.[language] || item.title?.en;
    const description = item.description?.[language] || item.description?.en;
    const slug = item.meta?.slug;
    const hint = item.meta?.imageHint;

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <div className="aspect-video relative">
                    <Image
                        src={item.thumbnail || "https://picsum.photos/seed/placeholder/600/400"}
                        alt={name || 'Temple'}
                        data-ai-hint={hint}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                </div>
            </CardContent>
            <CardHeader>
                <Badge variant="secondary">{t.feed.templeHighlight}</Badge>
                <CardTitle className="text-xl mt-1">{name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/temples/${slug}`}>
                        {t.feed.templeCardView} <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
