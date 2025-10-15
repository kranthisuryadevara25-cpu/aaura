
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookHeart, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { rituals as mockRituals } from '@/lib/rituals';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deities } from '@/lib/deities';

export default function RitualsPage() {
  const { language, t } = useLanguage();
  const rituals = mockRituals;
  const isLoading = false;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDeity, setFilterDeity] = useState('all');
  const [filteredRituals, setFilteredRituals] = useState(rituals);

  useEffect(() => {
    let updatedRituals = rituals;

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      updatedRituals = updatedRituals.filter(ritual => 
        (ritual.name[language] || ritual.name.en).toLowerCase().includes(lowercasedQuery) ||
        (ritual.description[language] || ritual.description.en).toLowerCase().includes(lowercasedQuery)
      );
    }

    if (filterDeity !== 'all') {
      updatedRituals = updatedRituals.filter(ritual => 
        (ritual.deity.en.toLowerCase().replace(/ /g, '-') === filterDeity)
      );
    }
    
    setFilteredRituals(updatedRituals);

  }, [searchQuery, filterDeity, rituals, language]);

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

        <div className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search rituals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Select value={filterDeity} onValueChange={setFilterDeity}>
            <SelectTrigger className="h-12 text-lg md:w-[200px]">
              <SelectValue placeholder="Filter by Deity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deities</SelectItem>
              {deities.map(deity => (
                <SelectItem key={deity.slug} value={deity.slug}>{deity.name.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : filteredRituals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRituals.map((ritual: any) => {
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
        ) : (
             <div className="text-center py-16 text-muted-foreground">
                <p>No rituals found matching your criteria.</p>
            </div>
        )}
    </main>
  );
}
