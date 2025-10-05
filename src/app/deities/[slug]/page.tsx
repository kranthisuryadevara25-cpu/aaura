
'use client';

import { useParams } from 'next/navigation';
import { getDeityBySlug } from '@/lib/deities';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { notFound } from 'next/navigation';
import { Music, BookOpen, Sparkles, Sunrise, Sunset, Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { useEffect, useState } from 'react';
import { getDeityDailyRelevance, type DeityDailyRelevanceOutput } from '@/ai/flows/deity-daily-relevance';
import { useLanguage } from '@/hooks/use-language.tsx';

export default function DeityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const deity = getDeityBySlug(slug);
  const { language } = useLanguage();
  const [dailyContent, setDailyContent] = useState<DeityDailyRelevanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!deity) {
    notFound();
  }

  const name = (deity.name as any)[language] || deity.name.en;
  const description = (deity.description as any)[language] || deity.description.en;

  useEffect(() => {
    if (deity) {
      setIsLoading(true);
      getDeityDailyRelevance({ deityName: deity.name.en }) // AI flow works best with English name
        .then(content => {
          setDailyContent(content);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [deity]);


  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
              <Navigation />
          </Sidebar>
          <SidebarInset>
              <main className="container mx-auto px-4 py-8 md:py-12">
                  <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
                  <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">{description}</p>
                  </div>

                  <Carousel className="w-full max-w-4xl mx-auto mb-12">
                  <CarouselContent>
                      {deity.images.map((image, index) => (
                      <CarouselItem key={index}>
                          <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20">
                          <Image
                              src={image.url}
                              alt={`${name} image ${index + 1}`}
                              data-ai-hint={image.hint}
                              fill
                              className="object-cover"
                          />
                          </div>
                      </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                  </Carousel>

                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : dailyContent && (
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><Sunrise /> Today's Relevance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground/90">{dailyContent.todaysRelevance}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><Sunset /> Tomorrow's Importance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground/90">{dailyContent.tomorrowsImportance}</p>
                            </CardContent>
                        </Card>
                    </div>
                  )}


                  <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                      <Card className="bg-card border-border">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-primary"><Music /> Mantras</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              {deity.mantras.map((mantra, index) => {
                                const translationKey = `translation_${language}` as keyof typeof mantra;
                                const translation = (mantra as any)[translationKey] || mantra.translation_en;
                                return (
                                  <div key={index}>
                                      <p className="text-xl font-semibold font-body text-foreground">{mantra.sanskrit}</p>
                                      <p className="text-muted-foreground italic">{translation}</p>
                                  </div>
                                );
                              })}
                          </CardContent>
                      </Card>

                      <Card className="bg-card border-border">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> Stotras</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              {deity.stotras.map((stotra, index) => {
                                const title = (stotra.title as any)[language] || stotra.title.en;
                                const translationKey = `translation_${language}` as keyof typeof stotra;
                                const translation = (stotra as any)[translationKey] || stotra.translation_en;
                                return(
                                  <div key={index}>
                                      <h4 className="font-semibold text-lg text-foreground">{title}</h4>
                                      <p className="font-body text-foreground/80 mt-1">{stotra.sanskrit}</p>
                                      <p className="text-muted-foreground text-sm mt-1 italic">{translation}</p>
                                  </div>
                                )
                              })}
                          </CardContent>
                      </Card>
                  </div>
              </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
