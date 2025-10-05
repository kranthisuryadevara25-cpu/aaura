'use client';

import { Deity } from '@/lib/deities';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DeityCard({ deity }: { deity: Deity & { id: string } }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                        <Image src={deity.images[0].url} alt={deity.name} data-ai-hint={deity.images[0].hint} fill className="object-cover" />
                    </div>
                    <div>
                        <Badge variant="secondary">Deity Profile</Badge>
                        <CardTitle className="text-xl mt-1">{deity.name}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="line-clamp-3 mb-4">{deity.description}</CardDescription>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/deities/${deity.slug}`}>
                        Read More <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
