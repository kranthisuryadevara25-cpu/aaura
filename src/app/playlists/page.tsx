

'use server';

import { db as adminDb } from '@/lib/firebase/admin';
import { Button } from '@/components/ui/button';
import { ListMusic, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { PlaylistClientPage } from './PlaylistClientPage';
import type { DocumentData } from 'firebase/firestore';

async function getPublicPlaylists() {
  try {
    const playlistsQuery = adminDb.collection('playlists').where('isPublic', '==', true);
    
    const querySnapshot = await playlistsQuery.get();
    
    const playlists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
    }));
    return playlists;
  } catch (error) {
    console.error("Failed to fetch public playlists:", error);
    return [];
  }
}

export default async function PlaylistsPage() {
  const initialPublicPlaylists = await getPublicPlaylists();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
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

      <PlaylistClientPage initialPublicPlaylists={initialPublicPlaylists as DocumentData[]} />
    </main>
  );
}

  