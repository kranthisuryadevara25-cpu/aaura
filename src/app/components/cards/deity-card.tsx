
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import type { FeedItem } from '@/types/feed';

export function DeityCard({ item }: { item: FeedItem }) {
    const { language } = useLanguage();

    const name = item.title?.[language] || item.title?.en;
    const description = item.description?.[language] || item.description?.en;
    const slug = item.meta?.slug;
    const hint = item.meta?.imageHint;

    return (
        <Link href={`/deities/${slug}`} className="group">
            <div className="flex flex-col space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
                    <Image 
                        src={item.thumbnail || "https://picsum.photos/seed/placeholder/400/400"} 
                        alt={name || 'Deity'} 
                        data-ai-hint={hint} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div>
                    <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary">{name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                </div>
            </div>
        </Link>
    );
}
