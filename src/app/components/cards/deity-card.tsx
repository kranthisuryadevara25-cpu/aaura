
'use client';

import { Deity } from '@/lib/deities';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export function DeityCard({ deity }: { deity: Deity & { id: string } }) {
    const { language } = useLanguage();

    const name = (deity.name as any)[language] || deity.name;
    const description = (deity.description as any)[language] || deity.description;

    return (
        <Link href={`/deities/${deity.slug}`} className="group">
            <div className="flex flex-col space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
                    <Image 
                        src={deity.images[0].url} 
                        alt={name} 
                        data-ai-hint={deity.images[0].hint} 
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
