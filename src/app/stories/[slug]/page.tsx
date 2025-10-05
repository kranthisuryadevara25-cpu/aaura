
'use client';

import { useParams, notFound } from 'next/navigation';
import { getStoryBySlug } from '@/lib/stories';
import { getCharacterBySlug } from '@/lib/characters';
import { getTempleBySlug } from '@/lib/temples';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Palmtree, UserSquare } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const story = getStoryBySlug(slug);
  const { language } = useLanguage();

  if (!story) {
    notFound();
  }

  const title = story.title[language] || story.title.en;
  const summary = story.summary[language] || story.summary.en;
  const fullText = story.fullText[language] || story.fullText.en;

  const relatedCharacters = story.relatedCharacters.map(slug => getCharacterBySlug(slug)).filter(Boolean);
  const relatedTemples = story.relatedTemples.map(slug => getTempleBySlug(slug)).filter(Boolean);

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
                          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{title}</h1>
                          <div className="mt-4 flex justify-center flex-wrap gap-2">
                              {story.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                          </div>
                      </header>

                      <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                          <Image
                              src={story.image.url}
                              alt={title}
                              data-ai-hint={story.image.hint}
                              fill
                              className="object-cover"
                          />
                      </div>

                      <Card className="bg-transparent border-primary/20 mb-8">
                          <CardHeader>
                              <CardTitle className="text-2xl text-primary">Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-lg text-foreground/90">{summary}</p>
                          </CardContent>
                      </Card>
                      
                       <Card className="bg-transparent border-primary/20 mb-8">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> The Full Story</CardTitle>
                          </CardHeader>
                          <CardContent className="prose prose-lg max-w-none text-foreground/90">
                              <p>{fullText}</p>
                              <p><em>(Full text, audio, and video versions coming soon)</em></p>
                          </CardContent>
                      </Card>

                      {relatedCharacters.length > 0 && (
                          <Card className="bg-transparent border-primary/20 mb-8">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-primary"><UserSquare /> Key Characters</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {relatedCharacters.map(character => character && (
                                      <Link key={character.id} href={`/characters/${character.slug}`} className="block p-4 text-center rounded-lg hover:bg-primary/10 border border-primary/20 transition-colors">
                                          <div className="w-24 h-24 relative mx-auto rounded-full overflow-hidden mb-2 border-2 border-accent/20">
                                            <Image src={character.image.url} alt={character.name[language] || character.name.en} data-ai-hint={character.image.hint} fill className="object-cover" />
                                          </div>
                                          <h4 className="font-semibold text-md text-foreground group-hover:underline">{character.name[language] || character.name.en}</h4>
                                      </Link>
                                  ))}
                              </CardContent>
                          </Card>
                      )}

                      {relatedTemples.length > 0 && (
                          <Card className="bg-transparent border-primary/20">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-primary"><Palmtree /> Related Temples</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {relatedTemples.map(temple => temple && (
                                      <Link key={temple.id} href={`/temples/${temple.slug}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-primary/10 border border-primary/20 transition-colors">
                                          <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
                                            <Image src={temple.media.images[0].url} alt={temple.name} data-ai-hint={temple.media.images[0].hint} fill className="object-cover" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-lg text-primary group-hover:underline">{temple.name}</h4>
                                            <p className="text-sm text-muted-foreground">{temple.location.city}, {temple.location.state}</p>
                                          </div>
                                           <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
                                      </Link>
                                  ))}
                              </CardContent>
                          </Card>
                      )}

                  </article>
              </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
