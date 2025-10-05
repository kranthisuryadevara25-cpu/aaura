
'use client';

import { characters } from '@/lib/characters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, UserSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';

export default function CharactersPage() {
  const { language, t } = useLanguage();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <UserSquare className="h-10 w-10" /> {t.characters.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.characters.description}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {characters.map((character) => {
          const name = character.name[language] || character.name.en;
          const description = character.description[language] || character.description.en;
          const role = character.role[language] || character.role.en;
          return (
            <Card key={character.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-video relative">
                        <Image
                            src={character.image.url}
                            alt={name}
                            data-ai-hint={character.image.hint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-primary">{name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{role}</Badge>
                    <CardDescription className="line-clamp-3 pt-2">{description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={`/characters/${character.slug}`}>
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
