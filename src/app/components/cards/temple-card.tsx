
'use client';

import { Temple } from '@/lib/temples';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TempleCard({ temple }: { temple: Temple & { id: string } }) {
    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <div className="aspect-video relative">
                    <Image
                        src={temple.media.images[0].url}
                        alt={temple.name}
                        data-ai-hint={temple.media.images[0].hint}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                </div>
            </CardContent>
            <CardHeader>
                <Badge variant="secondary">Temple Highlight</Badge>
                <CardTitle className="text-xl mt-1">{temple.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {temple.location.city}, {temple.location.state}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/temples/${temple.slug}`}>
                        View Temple <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
