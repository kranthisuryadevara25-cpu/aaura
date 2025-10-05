
'use client';

import { useParams, notFound } from 'next/navigation';
import { getCharacterBySlug } from '@/lib/characters';
import { getStoryBySlug } from '@/lib/stories';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function CharacterDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const character = getCharacterBySlug(slug);
  const { language, t } = useLanguage();

  if (!character) {
    notFound();
  }
  
  const name = character.name[language] || character.name.en;
  const description = character.description[language] || character.description.en;
  const role = character.role[language] || character.role.en;
  const associatedStories = character.associatedStories.map(slug => getStoryBySlug(slug)).filter(Boolean);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
              <Card className="sticky top-24 bg-transparent border-primary/20">
                    <div className="aspect-square relative rounded-t-lg overflow-hidden">
                      <Image
                          src={character.image.url}
                          alt={name}
                          data-ai-hint={character.image.hint}
                          fill
                          className="object-cover"
                      />
                  </div>
                  <CardHeader>
                      <CardTitle className="text-4xl font-headline text-primary">{name}</CardTitle>
                      <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="default">{role}</Badge>
                          {character.attributes.map(attr => <Badge key={attr} variant="secondary">{attr}</Badge>)}
                      </div>
                  </CardHeader>
              </Card>
          </div>
          <div className="md:col-span-2 space-y-8">
              <Card className="bg-transparent border-primary/20">
                  <CardHeader>
                      <CardTitle className="text-2xl text-primary">{t.characterDetail.about} {name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-lg text-foreground/90">{description}</p>
                  </CardContent>
              </Card>
              
              {associatedStories.length > 0 && (
                  <Card className="bg-transparent border-primary/20">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> {t.characterDetail.associatedStories}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {associatedStories.map(story => story && (
                              <Link key={story.id} href={`/stories/${story.slug}`} className="block p-4 rounded-lg hover:bg-primary/10 border border-primary/20 transition-colors">
                                  <h4 className="font-semibold text-lg text-primary group-hover:underline">{story.title[language] || story.title.en}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{story.summary[language] || story.summary.en}</p>
                              </Link>
                          ))}
                      </CardContent>
                  </Card>
              )}
          </div>
      </div>
    </main>
  );
}
