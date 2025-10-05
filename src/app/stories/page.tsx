
'use client';

import { Header } from '@/app/components/header';
import { stories } from '@/lib/stories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';

export default function StoriesPage() {
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
                          <ScrollText className="h-10 w-10" /> Mythological Stories
                      </h1>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                          Explore the timeless epics and folk tales that have shaped generations.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stories.map((story) => (
                      <Card key={story.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                          <CardContent className="p-0">
                              <div className="aspect-video relative">
                                  <Image
                                      src={story.image.url}
                                      alt={story.title}
                                      data-ai-hint={story.image.hint}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                              </div>
                          </CardContent>
                          <CardHeader>
                              <CardTitle className="text-primary">{story.title}</CardTitle>
                              <CardDescription className="line-clamp-3">{story.summary}</CardDescription>
                          </CardHeader>
                          <CardContent className="mt-auto">
                              <Button asChild className="w-full">
                                  <Link href={`/stories/${story.slug}`}>
                                      Read Story <ArrowRight className="ml-2" />
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
