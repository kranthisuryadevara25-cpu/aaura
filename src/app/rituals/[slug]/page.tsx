'use client';

import { useParams, notFound } from 'next/navigation';
import { getRitualBySlug } from '@/lib/rituals';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, ShoppingBasket, Clock } from 'lucide-react';

export default function RitualDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const ritual = getRitualBySlug(slug);

  if (!ritual) {
    notFound();
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
              <main className="container mx-auto px-4 py-8 md:py-12">
                  <article className="max-w-4xl mx-auto">
                      <header className="text-center mb-8">
                          <Badge variant="default" className="mb-2">{ritual.deity}</Badge>
                          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{ritual.name}</h1>
                          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{ritual.description}</p>
                      </header>

                      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                          <Image
                              src={ritual.image.url}
                              alt={ritual.name}
                              data-ai-hint={ritual.image.hint}
                              fill
                              className="object-cover"
                          />
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-8">
                          <div className="md:col-span-2">
                               <Card className="bg-transparent border-primary/20 mb-8">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-3 text-primary"><CheckSquare /> Step-by-Step Procedure</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <ol className="list-decimal list-inside space-y-4 text-foreground/90">
                                          {ritual.procedure.map((step, index) => (
                                              <li key={index}>{step}</li>
                                          ))}
                                      </ol>
                                  </CardContent>
                              </Card>
                          </div>
                          <div className="space-y-6">
                              <Card className="bg-transparent border-primary/20 sticky top-24">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-3 text-primary"><ShoppingBasket /> Items Required</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <ul className="list-disc list-inside space-y-2 text-foreground/90">
                                          {ritual.itemsRequired.map((item, index) => (
                                              <li key={index}>{item}</li>
                                          ))}
                                      </ul>
                                  </CardContent>
                              </Card>
                               <Card className="bg-transparent border-primary/20">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-3 text-primary"><Clock /> Auspicious Time</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <p className="text-foreground/90">{ritual.auspiciousTime}</p>
                                  </CardContent>
                              </Card>
                          </div>
                      </div>
                  </article>
              </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
