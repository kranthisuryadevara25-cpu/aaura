
'use client';

import { Deity } from '@/lib/deities';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export function DeityCard({ deity }: { deity: Deity & { id: string } }) {
    return (
        <Link href={`/deities/${deity.slug}`} className="group">
            <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-video relative">
                        <Image 
                            src={deity.images[0].url} 
                            alt={deity.name} 
                            data-ai-hint={deity.images[0].hint} 
                            fill 
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className="p-4">
                        <h4 className="font-semibold text-foreground truncate">{deity.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{deity.description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
