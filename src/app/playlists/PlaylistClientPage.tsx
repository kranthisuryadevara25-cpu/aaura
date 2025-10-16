'use client';

import { useState, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListMusic, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const playlistCategories = ["Deities", "Stories", "Rituals", "Festivals", "Peace", "Devotion"];

export function PlaylistClientPage({ initialPlaylists }: { initialPlaylists: DocumentData[] }) {
  const db = useFirestore();
  const playlistsQuery = query(collection(db, 'playlists'), where('isPublic', '==', true));
  // The hook will use initialData and then listen for real-time updates.
  const [playlists, isLoading] = useCollectionData(playlistsQuery, {
    idField: 'id',
    initialValue: initialPlaylists,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredPlaylists = useMemo(() => {
    let items = playlists || [];

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      items = items.filter(playlist =>
        playlist.title.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (filterCategory !== 'all') {
      items = items.filter(playlist =>
        playlist.category === filterCategory
      );
    }

    return items.filter(item => item && item.id); // Ensure item and id are valid
  }, [searchQuery, filterCategory, playlists]);

  return (
    <>
      <div className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-12 text-lg md:w-[200px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {playlistCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (!filteredPlaylists || filteredPlaylists.length === 0) ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : filteredPlaylists && filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlaylists.map((playlist) => (
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
          <h2 className="mt-6 text-2xl font-semibold text-foreground">No Playlists Found</h2>
          <p className="mt-2 text-muted-foreground">
            No public playlists match your search criteria. Try creating one!
          </p>
        </div>
      )}
    </>
  );
}
