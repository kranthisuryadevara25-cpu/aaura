
'use client';

import { temples } from '@/lib/temples';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Palmtree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

export default function TemplesPage() {
  const { language, t } = useLanguage();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <Palmtree className="h-10 w-10" /> {t.temples.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.temples.description}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {temples.map((temple) => {
          const name = temple.name[language] || temple.name.en;
          
          return (
            <Card key={temple.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-video relative">
                        <Image
                            src={temple.media.images[0].url}
                            alt={name}
                            data-ai-hint={temple.media.images[0].hint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-primary">{name}</CardTitle>
                    <CardDescription className="line-clamp-3">{temple.location.city}, {temple.location.state}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={`/temples/${temple.slug}`}>
                            {t.buttons.explore} <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          )
        })}
        </div>
    </main>
  );
}
