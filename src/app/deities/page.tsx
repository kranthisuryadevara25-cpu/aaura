
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { Input } from '@/components/ui/input';

export default function DeitiesPage() {
  const { language, t } = useLanguage();
  const db = useFirestore();
  const [deities, isLoading] = useCollectionData(collection(db, 'deities'), { idField: 'id' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeities, setFilteredDeities] = useState<DocumentData[] | undefined>([]);

  useEffect(() => {
    if (deities) {
      if (searchQuery.trim() === '') {
        setFilteredDeities(deities);
      } else {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = deities.filter((deity) => {
          const name = (deity.name as any)[language] || deity.name.en;
          return name.toLowerCase().includes(lowercasedQuery);
        });
        setFilteredDeities(filtered);
      }
    }
  }, [searchQuery, deities, language]);

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">{t.deities.title}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.deities.description}
            </p>
        </div>

        <div className="mb-8 max-w-lg mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for a deity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : filteredDeities && filteredDeities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeities.map((deity: any) => {
                const name = (deity.name as any)[language] || deity.name.en;
                const description = (deity.description as any)[language] || deity.description.en;
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
            )})}
            </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No deities found matching your search.</p>
          </div>
        )}
    </main>
  );
}
