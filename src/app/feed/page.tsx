
'use client';

import { useState, useEffect, useCallback } from "react";
import { Feed } from "@/app/components/feed";
import { CreateContent } from "@/app/components/CreateContent";
import { useFeed } from "@/hooks/use-feed";
import { SearchBar } from "@/components/SearchBar";
import type { FeedItem } from "@/types/feed";

export default function FeedPage() {
  const { allItems, loading } = useFeed(); // Removed loadMore and canLoadMore for simplicity
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    setFilteredItems(allItems);
  }, [allItems]);

  const handleSearch = useCallback((query: string) => {
    if (!query) {
      setFilteredItems(allItems);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const filtered = allItems.filter(item => {
      const title = item.title ? (item.title['en'] || Object.values(item.title)[0] || '') : '';
      const description = item.description ? (item.description['en'] || Object.values(item.description)[0] || '') : '';
      return title.toLowerCase().includes(lowerCaseQuery) || description.toLowerCase().includes(lowerCaseQuery);
    });
    setFilteredItems(filtered);
  }, [allItems]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
      {isClient && <CreateContent />}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline text-primary">For You</h2>
        <SearchBar onSearch={handleSearch} />
        <Feed items={filteredItems} isLoading={loading && allItems.length === 0} />
      </div>
    </div>
  );
}
