'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, Music, Mic, Upload, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { media as mockMedia } from '@/lib/media';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mediaTypes = ['all', 'video', 'short', 'bhajan', 'podcast', 'pravachan', 'audiobook'];

const getIconForType = (type: string) => {
    switch (type) {
        case 'bhajan':
        case 'audiobook':
        case 'audio':
            return <Music className="w-5 h-5 mr-2" />;
        case 'podcast':
        case 'pravachan':
            return <Mic className="w-5 h-5 mr-2" />;
        default:
            return <Film className="w-5 h-5 mr-2" />;
    }
}

export default function MediaPage() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const media = mockMedia.filter(item => item.status === 'approved');
  const isLoading = false;

  const filteredMedia = useMemo(() => {
    if (!media) return [];
    
    let updatedMedia = media;

    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        updatedMedia = updatedMedia.filter(item => 
            (item[`title_${language}` as keyof typeof item] || item.title_en).toLowerCase().includes(lowercasedQuery)
        );
    }

    if (filterType !== 'all') {
        updatedMedia = updatedMedia.filter(item => item.mediaType === filterType);
    }
    
    return updatedMedia;

  }, [searchQuery, filterType, media, language]);
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
            {t.media.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {t.media.description}
            </p>
        </div>
        <Button asChild size="lg">
            <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                {t.media.uploadButton}
            </Link>
        </Button>
      </div>

       <div className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-12 text-lg md:w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              {mediaTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : filteredMedia && filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item: any) => {
            const title = item[`title_${language}` as keyof typeof item] || item.title_en;
            const description = item.userId; // Placeholder for author name
            return (
            <Link href={`/watch/${item.id}`} key={item.id} className="group">
              <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0 mb-3">
                  <div className="aspect-video relative rounded-t-lg overflow-hidden">
                    <Image
                      src={item.thumbnailUrl}
                      alt={title}
                      data-ai-hint={item.imageHint}
                      fill
                      className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                      <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center capitalize">
                        {getIconForType(item.mediaType)}
                        <span>{item.mediaType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
                <CardHeader className="p-4 pt-0">
                  <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                    {title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          )})}
        </div>
      ) : (
        <div className="text-center py-16">
          <Music className="mx-auto h-24 w-24 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-semibold text-foreground">{t.media.noMediaFound}</h2>
           <p className="mt-2 text-muted-foreground">
             No media found matching your criteria. Try adjusting your search.
          </p>
        </div>
      )}
    </main>
  );
}
