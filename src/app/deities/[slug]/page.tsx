
'use client';

import { useParams } from 'next/navigation';
import { getDeityBySlug } from '@/lib/deities';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { notFound } from 'next/navigation';
import { Music, BookOpen } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '../../navigation';

export default function DeityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const deity = getDeityBySlug(slug);

  if (!deity) {
    notFound();
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <Navigation />
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{deity.name}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">{deity.description}</p>
                </div>

                <Carousel className="w-full max-w-4xl mx-auto mb-12">
                <CarouselContent>
                    {deity.images.map((image, index) => (
                    <CarouselItem key={index}>
                        <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20">
                        <Image
                            src={image.url}
                            alt={`${deity.name} image ${index + 1}`}
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

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><Music /> Mantras</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {deity.mantras.map((mantra, index) => (
                                <div key={index}>
                                    <p className="text-xl font-semibold font-body text-foreground">{mantra.sanskrit}</p>
                                    <p className="text-muted-foreground italic">{mantra.translation}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> Stotras</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {deity.stotras.map((stotra, index) => (
                                <div key={index}>
                                    <h4 className="font-semibold text-lg text-foreground">{stotra.title}</h4>
                                    <p className="font-body text-foreground/80 mt-1">{stotra.sanskrit}</p>
                                    <p className="text-muted-foreground text-sm mt-1 italic">{stotra.translation}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
