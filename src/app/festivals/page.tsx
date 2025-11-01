
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PartyPopper, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { Input } from '@/components/ui/input';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { collection, query, DocumentData } from 'firebase/firestore';


export default function FestivalsPage() {
  const { language, t } = useLanguage();
  const db = useFirestore();
  const festivalsQuery = useMemo(() => query(collection(db, 'festivals')), [db]);
  const [festivals, isLoading] = useCollectionData(festivalsQuery, { idField: 'id' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFestivals, setFilteredFestivals] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (festivals) {
      if (searchQuery.trim() === '') {
        setFilteredFestivals(festivals);
      } else {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = festivals.filter((festival) => {
          const name = (festival.name as any)[language] || festival.name.en;
          return name.toLowerCase().includes(lowercasedQuery);
        });
        setFilteredFestivals(filtered);
      }
    }
  }, [searchQuery, festivals, language]);


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

        <div className="mb-8 max-w-lg mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for a festival..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFestivals?.map((festival: any) => {
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
                        <Badge variant="secondary" className="w-fit">{format(new Date(festival.date), 'MMMM do')}</Badge>
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
            )})}
            </div>
        )}
    </main>
  );
}
