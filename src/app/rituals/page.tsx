'use client';

import { Header } from '@/app/components/header';
import { rituals } from '@/lib/rituals';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Badge } from '@/components/ui/badge';

export default function RitualsPage() {
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
                      <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                          <BookHeart className="h-10 w-10" /> Rituals & Pooja Vidhi
                      </h1>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                          Learn step-by-step guides for daily pujas, festivals, and special ceremonies.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rituals.map((ritual) => (
                      <Card key={ritual.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                          <CardContent className="p-0">
                              <div className="aspect-video relative">
                                  <Image
                                      src={ritual.image.url}
                                      alt={ritual.name}
                                      data-ai-hint={ritual.image.hint}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                              </div>
                          </CardContent>
                          <CardHeader>
                              <CardTitle className="text-primary">{ritual.name}</CardTitle>
                              <Badge variant="secondary" className="w-fit">For: {ritual.deity}</Badge>
                              <CardDescription className="line-clamp-3 pt-2">{ritual.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="mt-auto">
                              <Button asChild className="w-full">
                                  <Link href={`/rituals/${ritual.slug}`}>
                                      View Procedure <ArrowRight className="ml-2" />
                                  </Link>
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
                  </div>
              </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
