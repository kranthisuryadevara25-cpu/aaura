
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListMusic, Loader2, PlusCircle, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DocumentData } from 'firebase/firestore';

const playlistCategories = ["Deities", "Stories", "Rituals", "Festivals", "Peace", "Devotion"];

export default function PlaylistsPage() {
  const { t } = useLanguage();
  const db = useFirestore();

  const playlistsQuery = query(collection(db, 'playlists'), where('isPublic', '==', true));
  const [playlists, isLoading] = useCollectionData(playlistsQuery, { idField: 'id' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];
    
    let updatedPlaylists = playlists;

    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        updatedPlaylists = updatedPlaylists.filter(playlist => 
            playlist.title.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (filterCategory !== 'all') {
        updatedPlaylists = updatedPlaylists.filter(playlist => 
            playlist.category === filterCategory
        );
    }
    
    return updatedPlaylists;

  }, [searchQuery, filterCategory, playlists]);


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


      {isLoading ? (
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
    </main>
  );
}
