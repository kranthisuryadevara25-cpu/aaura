
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, Music, Mic } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { media as mockMedia } from '@/lib/media';

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
  
  const media = mockMedia.filter(item => item.status === 'approved');
  const isLoading = false;
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
          {t.media.title}
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          {t.media.description}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : media && media.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item: any) => {
            const title = item[`title_${language}`] || item.title_en;
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
                      <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center">
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
            {t.media.startUploading}
          </p>
          <Button asChild className="mt-6">
            <Link href="/upload">{t.media.uploadButton}</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
