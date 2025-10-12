
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookHeart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';

export default function RitualsPage() {
  const { language, t } = useLanguage();
  const db = useFirestore();
  const [rituals, isLoading] = useCollectionData(collection(db, 'rituals'), { idField: 'id' });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <BookHeart className="h-10 w-10" /> {t.rituals.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.rituals.description}
            </p>
        </div>

        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rituals?.map((ritual: any) => {
                const name = ritual.name[language] || ritual.name.en;
                const description = ritual.description[language] || ritual.description.en;

                return (
                <Card key={ritual.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={ritual.image.url}
                                alt={name}
                                data-ai-hint={ritual.image.hint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-primary">{name}</CardTitle>
                        <Badge variant="secondary" className="w-fit">{t.rituals.forLabel}: {ritual.deity[language] || ritual.deity.en}</Badge>
                        <CardDescription className="line-clamp-3 pt-2">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/rituals/${ritual.slug}`}>
                                {t.buttons.viewProcedure} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )})}
            </div>
        )}
    </main>
  );
}
