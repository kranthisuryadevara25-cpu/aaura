
'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, Music, Mic } from 'lucide-react';
import { Header } from '@/app/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { placeholderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/hooks/use-language';

const getIconForType = (type: string) => {
    switch (type) {
        case 'bhajan':
        case 'audiobook':
            return <Music className="w-5 h-5 mr-2" />;
        case 'podcast':
        case 'pravachan':
            return <Mic className="w-5 h-5 mr-2" />;
        default:
            return <Film className="w-5 h-5 mr-2" />;
    }
}

export default function MediaPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { language, t } = useLanguage();

  const mediaQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'media'));
  }, [firestore]);

  const { data: media, isLoading } = useCollection(mediaQuery);
  
  const getImageForId = (id: string) => {
      const images = placeholderImages.filter(p => p.id.startsWith('video'));
      if (!media) return images[0].imageUrl;
      const index = media.findIndex(item => item.id === id);
      return images[index % images.length].imageUrl;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
            <Navigation />
          </Sidebar>
          <SidebarInset>
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
                  {media.map((item) => {
                    const title = item[`title_${language}`] || item.title_en;
                    const description = item[`description_${language}`] || item.description_en;
                    return (
                    <Link href="#" key={item.id} className="group">
                      <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
                        <CardContent className="p-0 mb-3">
                          <div className="aspect-video relative rounded-t-lg overflow-hidden">
                            <Image
                              src={getImageForId(item.id)}
                              alt={title}
                              fill
                              className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                            />
                             <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                {getIconForType(item.mediaType)}
                                <span>{item.mediaType}</span>
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
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
