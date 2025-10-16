
'use client';

import { useState } from "react";
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { getPersonalizedFeed, getTrendingContent } from '@/ai/flows/personalized-feed';
import { useFeed } from "@/hooks/use-feed";
import { SearchBar } from "@/components/SearchBar";
import type { FeedItem } from "@/types/feed";

// This component is now client-side to handle interactive search state.
// The initial data fetching is handled within the useFeed hook.
export default function Page() {
  const { allItems, loading } = useFeed();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = allItems.filter(item => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    const title = item.title ? (item.title['en'] || '') : '';
    const description = item.description ? (item.description['en'] || '') : '';
    return title.toLowerCase().includes(lowerCaseQuery) || description.toLowerCase().includes(lowerCaseQuery);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
      <CreateContent />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline text-primary">For You</h2>
        <SearchBar onSearch={setSearchQuery} />
        <Feed items={filteredItems} isLoading={loading} />
      </div>
    </div>
  );
}
