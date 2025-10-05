
'use client';

import { Header } from '@/app/components/header';
import { deities } from '@/lib/deities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '../navigation';

export default function DeitiesPage() {
  return (
    <SidebarProvider>
        <Sidebar>
            <Navigation />
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">Deity Explorer</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Discover the rich pantheon of Hindu gods and goddesses. Explore their stories, mantras, and significance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {deities.map((deity) => (
                    <Card key={deity.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={deity.images[0].url}
                                alt={deity.name}
                                data-ai-hint={deity.images[0].hint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-primary">{deity.name}</CardTitle>
                        <CardDescription className="line-clamp-3">{deity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/deities/${deity.slug}`}>
                                Explore <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
