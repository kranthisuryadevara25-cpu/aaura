
"use client";
import React, { useMemo } from "react";
import { Loader2, FileQuestion } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import sampleFeed from '@/lib/sample-feed.json';

type FeedItem = {
    type: string;
    id: string;
    [key: string]: any;
};

export function Feed({ searchQuery }: { searchQuery: string }) {
  
  const combinedFeed: FeedItem[] = sampleFeed.feed;
  const isLoading = false;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return combinedFeed;
    const lowercasedQuery = searchQuery.toLowerCase();

    return combinedFeed.filter(item => {
        const title = item.title || '';
        const summary = item.summary || '';
        const content = item.content || '';
        return title.toLowerCase().includes(lowercasedQuery) || 
               summary.toLowerCase().includes(lowercasedQuery) ||
               content.toLowerCase().includes(lowercasedQuery);
    });
  }, [searchQuery, combinedFeed]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
        {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
                return <FeedCard key={`${item.id}-${index}`} item={item} />
            })
        ) : (
             <div className="flex justify-center items-center h-96">
                <Alert className="max-w-md text-center">
                  <FileQuestion className="h-4 w-4" />
                  <AlertTitle>No Content Found</AlertTitle>
                  <AlertDescription>
                    We couldn't find any content for your feed right now. Why not create a post?
                  </AlertDescription>
                </Alert>
            </div>
        )}
    </>
  );
}
