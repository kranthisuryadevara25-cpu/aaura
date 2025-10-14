

'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Palmtree, UserSquare, Loader2, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { getStoryBySlug } from '@/lib/stories';
import { characters as allCharacters } from '@/lib/characters';
import { temples as allTemples } from '@/lib/temples';

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();
  
  const story = getStoryBySlug(slug);
  const [activeEpisode, setActiveEpisode] = useState(story?.episodes[0]);

  const relatedCharacters = useMemo(() => 
    story ? allCharacters.filter(c => story.relatedCharacters.includes(c.slug)) : [],
    [story]
  );
  
  const relatedTemples = useMemo(() =>
    story ? allTemples.filter(tm => story.relatedTemples.includes(tm.slug)) : [],
    [story]
  );

  if (!story) {
    return notFound();
  }

  const title = story.title[language] || story.title.en;
  const summary = story.summary[language] || story.summary.en;
  
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{title}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">{summary}</p>
                <div className="mt-4 flex justify-center flex-wrap gap-2">
                    {story.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Video Player and Details */}
                <div className="lg:col-span-2">
                    <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-primary/20 mb-4 bg-black">
                        {activeEpisode ? (
                             <iframe 
                                key={activeEpisode.videoId}
                                width="100%" 
                                height="100%" 
                                src={`https://www.youtube.com/embed/${activeEpisode.videoId}?autoplay=1`}
                                title={activeEpisode.title[language] || activeEpisode.title.en}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        ) : (
                           <Image
                                src={story.image.url}
                                alt={title}
                                data-ai-hint={story.image.hint}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    
                    <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">{activeEpisode?.title[language] || activeEpisode?.title.en || title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg text-foreground/90">{activeEpisode?.description[language] || activeEpisode?.description.en || summary}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Episode Playlist */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> Episodes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {story.episodes.map((episode) => (
                                <div
                                    key={episode.episodeNumber}
                                    onClick={() => setActiveEpisode(episode)}
                                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${activeEpisode?.episodeNumber === episode.episodeNumber ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
                                >
                                    <div className="relative w-24 h-14 shrink-0 rounded-md overflow-hidden bg-secondary">
                                        <Image src={episode.thumbnailUrl} alt={episode.title.en} fill className="object-cover"/>
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <PlayCircle className="h-6 w-6 text-white/80" />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-sm text-foreground line-clamp-2">{episode.title[language] || episode.title.en}</h4>
                                        <p className="text-xs text-muted-foreground">Episode {episode.episodeNumber}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Related Content Sections */}
            <div className="mt-12 max-w-5xl mx-auto space-y-12">
                {relatedCharacters.length > 0 && (
                    <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><UserSquare /> Key Characters</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedCharacters.map((character) => (
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
                            {relatedTemples.map((temple) => (
                                <Link key={temple.id} href={`/temples/${temple.slug}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-primary/10 border border-primary/20 transition-colors">
                                    <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
                                        <Image src={temple.media.images[0].url} alt={temple.name[language] || temple.name.en} data-ai-hint={temple.media.images[0].hint} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-primary group-hover:underline">{temple.name[language] || temple.name.en}</h4>
                                        <p className="text-sm text-muted-foreground">{temple.location.city}, {temple.location.state}</p>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </article>
    </main>
  );
}
