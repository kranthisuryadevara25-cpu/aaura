
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, type DocumentData, or } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListMusic, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PlaylistGrid = ({ playlists }: { playlists: DocumentData[] }) => {
  if (playlists.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <ListMusic className="mx-auto h-24 w-24 text-muted-foreground/50" />
        <h2 className="mt-6 text-2xl font-semibold text-foreground">No Playlists Found</h2>
        <p className="mt-2 text-muted-foreground">
          No playlists match your current filters.
        </p>
      </div>
    );
  }

  return (
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
  );
};

export function PlaylistClientPage({ initialPublicPlaylists }: { initialPublicPlaylists: DocumentData[] }) {
  const db = useFirestore();
  const [user] = useAuthState(useAuth());
  
  const playlistsQuery = useMemo(() => {
    if (!user) {
      return query(collection(db, 'playlists'), where('isPublic', '==', true));
    }
    // Fetch public playlists OR playlists created by the current user
    return query(collection(db, 'playlists'), or(where('isPublic', '==', true), where('creatorId', '==', user.uid)));
  }, [db, user]);

  const [allPlaylists, isLoading] = useCollectionData(playlistsQuery, { idField: 'id' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('public');

  const myPlaylists = useMemo(() => {
    return allPlaylists?.filter(p => p.creatorId === user?.uid) || [];
  }, [allPlaylists, user]);

  const publicPlaylists = useMemo(() => {
     if (!allPlaylists) return initialPublicPlaylists;
     // De-duplicate in case a user's playlist is also public
     const uniqueIds = new Set(myPlaylists.map(p => p.id));
     return allPlaylists.filter(p => p.isPublic && !uniqueIds.has(p.id));
  }, [allPlaylists, myPlaylists, initialPublicPlaylists]);

  const filteredPlaylists = useMemo(() => {
    let itemsToFilter = activeTab === 'my-playlists' ? myPlaylists : publicPlaylists;

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      itemsToFilter = itemsToFilter.filter(playlist =>
        playlist.title.toLowerCase().includes(lowercasedQuery)
      );
    }
    return itemsToFilter;
  }, [searchQuery, activeTab, myPlaylists, publicPlaylists]);

  return (
    <>
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="public">Public Playlists</TabsTrigger>
          <TabsTrigger value="my-playlists" disabled={!user}>My Playlists</TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          ) : (
            <PlaylistGrid playlists={filteredPlaylists} />
          )}
        </TabsContent>
        <TabsContent value="my-playlists">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          ) : (
            <PlaylistGrid playlists={filteredPlaylists} />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
