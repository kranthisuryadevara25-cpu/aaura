
'use client';

import { useParams, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, PlayCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { rituals } from '@/lib/rituals';

// In a real app, you would fetch this from a 'playlists' collection in Firestore
const getPlaylistById = (id: string) => {
    const allPlaylists = rituals.map(r => r.recommendedPlaylist).filter(Boolean);
    return allPlaylists.find(p => p.id === id);
}


export default function PlaylistDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const playlist = getPlaylistById(id);

  if (!playlist) {
    notFound();
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
                 <div className="relative aspect-video bg-secondary">
                    <Image src={`https://picsum.photos/seed/${playlist.id}/800/450`} alt={playlist.title} layout="fill" className="object-cover" />
                 </div>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-primary">{playlist.title}</CardTitle>
                    <CardDescription>A curated collection of mantras and bhajans to aid your spiritual practice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" /> Play All
                    </Button>
                    <div className="space-y-3 pt-4">
                        {playlist.tracks.map((track, index) => (
                             <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                <div>
                                    <p className="font-semibold text-foreground">{track.title}</p>
                                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
