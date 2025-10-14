
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListMusic, Loader2, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

export default function PlaylistsPage() {
  const { t } = useLanguage();
  const db = useFirestore();

  const playlistsQuery = query(collection(db, 'playlists'), where('isPublic', '==', true));
  const [playlists, isLoading] = useCollectionData(playlistsQuery, { idField: 'id' });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <div className="text-left mb-4 sm:mb-0">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
            <ListMusic className="h-10 w-10" />
            Spiritual Playlists
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Create, discover, and enjoy curated collections of mantras, stories, and music.
          </p>
        </div>
        <Button asChild>
          <Link href="/playlists/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Playlist
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Link href={`/playlists/${playlist.id}`} key={playlist.id} className="group">
              <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 h-full flex flex-col">
                 <div className="relative aspect-video bg-secondary">
                    <Image src={`https://picsum.photos/seed/${playlist.id}/600/400`} alt={playlist.title} layout="fill" className="object-cover" />
                 </div>
                <CardHeader>
                  <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                    {playlist.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {playlist.description || `${playlist.items?.length || 0} items`}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ListMusic className="mx-auto h-24 w-24 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-semibold text-foreground">No Public Playlists Found</h2>
          <p className="mt-2 text-muted-foreground">
            Be the first to create a public playlist and share it with the community!
          </p>
        </div>
      )}
    </main>
  );
}

    