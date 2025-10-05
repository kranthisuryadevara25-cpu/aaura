
'use client';

import { festivals } from '@/lib/festivals';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';

export default function FestivalsPage() {
  const { language, t } = useLanguage();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <PartyPopper className="h-10 w-10" /> {t.festivals.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.festivals.description}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {festivals.map((festival) => {
          const name = festival.name[language] || festival.name.en;
          const description = festival.description[language] || festival.description.en;
          return (
            <Card key={festival.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-video relative">
                        <Image
                            src={festival.image.url}
                            alt={name}
                            data-ai-hint={festival.image.hint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-primary">{name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{format(festival.date, 'MMMM do')}</Badge>
                    <CardDescription className="line-clamp-3 pt-2">{description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={`/festivals/${festival.slug}`}>
                            {t.buttons.learnMore} <ArrowRight className="ml-2" />
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
