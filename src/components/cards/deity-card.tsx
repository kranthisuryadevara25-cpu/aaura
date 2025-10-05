
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Deity } from '@/lib/deities';
import { useLanguage } from '@/hooks/use-language';

export function DeityCard({ deity }: { deity: Deity & { id: string } }) {
  const { language, t } = useLanguage();
  
  const name = deity.name[language] || deity.name.en;
  const description = deity.description[language] || deity.description.en;

  return (
    <Card key={deity.id} className="flex flex-col overflow-hidden group bg-card border-border hover:border-primary/50 transition-colors duration-300">
      <CardContent className="p-0">
        <div className="aspect-video relative">
          <Image
            src={deity.images[0].url}
            alt={name}
            data-ai-hint={deity.images[0].hint}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle className="text-primary">{name}</CardTitle>
        <CardDescription className="line-clamp-3">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button asChild className="w-full">
          <Link href={`/deities/${deity.slug}`}>
            {t.buttons.explore} <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
