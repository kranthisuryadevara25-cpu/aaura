
'use client';

import { useParams, notFound } from 'next/navigation';
import { getFestivalBySlug } from '@/lib/festivals';
import { getDeityBySlug } from '@/lib/deities';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function FestivalDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const festival = getFestivalBySlug(slug);
  const { language, t } = useLanguage();

  if (!festival) {
    notFound();
  }

  const name = festival.name[language] || festival.name.en;
  const description = festival.description[language] || festival.description.en;
  const significance = festival.significance[language] || festival.significance.en;
  const rituals = festival.rituals[language] || festival.rituals.en;

  const associatedDeities = festival.associatedDeities.map(slug => getDeityBySlug(slug)).filter(Boolean);

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
                          <Badge variant="default" className="text-lg mb-2">
                             <Calendar className="mr-2" /> {format(festival.date, 'MMMM do, yyyy')}
                          </Badge>
                          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
                          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{description}</p>
                      </header>

                      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                          <Image
                              src={festival.image.url}
                              alt={name}
                              data-ai-hint={festival.image.hint}
                              fill
                              className="object-cover"
                          />
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-8">
                          <div className="md:col-span-2">
                               <Card className="bg-transparent border-primary/20 mb-8">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-3 text-primary"><Sparkles /> {t.festivalDetail.significance}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <p className="text-foreground/90">{significance}</p>
                                  </CardContent>
                              </Card>
                               <Card className="bg-transparent border-primary/20">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-3 text-primary"><CheckSquare /> {t.festivalDetail.keyRituals}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <ul className="list-disc list-inside space-y-2 text-foreground/90">
                                          {rituals.map((ritual, index) => (
                                              <li key={index}>{ritual}</li>
                                          ))}
                                      </ul>
                                  </CardContent>
                              </Card>
                          </div>
                          <div className="space-y-6">
                              {associatedDeities.length > 0 && (
                                <Card className="bg-transparent border-primary/20 sticky top-24">
                                    <CardHeader>
                                        <CardTitle>{t.festivalDetail.associatedDeities}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {associatedDeities.map(deity => deity && (
                                            <Link key={deity.id} href={`/deities/${deity.slug}`} className="group flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                                                    <Image src={deity.images[0].url} alt={deity.name[language] || deity.name.en} data-ai-hint={deity.images[0].hint} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm group-hover:text-primary">{deity.name[language] || deity.name.en}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                              )}
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
