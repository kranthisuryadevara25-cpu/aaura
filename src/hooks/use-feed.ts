
"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";

const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

export const useFeed = (pageSize = 20) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [lastCursor, setLastCursor] = useState<string | undefined>(undefined);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);

    try {
        const feedResponse = await getPersonalizedFeed({ 
            userId: user?.uid, 
            pageSize,
            lastCursor: lastCursor
        });

        if (feedResponse.feed.length === 0) {
            setCanLoadMore(false);
            setLoading(false);
            return;
        }
        
        // The AI flow now returns fully populated items
        const newItems = feedResponse.feed;

        setAllItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
            return [...prev, ...uniqueNewItems];
        });

        // The AI flow doesn't support cursors yet, so we prevent further loading for now.
        // This prevents duplicate items from being loaded.
        setCanLoadMore(false); 
        // setLastCursor(newCursor); 

    } catch (error) {
        console.error("Failed to fetch personalized feed:", error);
        setCanLoadMore(false); // Stop trying if there's an error
    } finally {
        setLoading(false);
    }
  }, [loading, canLoadMore, user, pageSize, lastCursor]);

  useEffect(() => {
    if(allItems.length === 0) { // Only run initial load if feed is empty
      loadMore();
    }
  }, [user]); // Rerun if user logs in or out

  const filterItems = useCallback((searchQuery: string): FeedItem[] => {
    if (!searchQuery) {
        return allItems;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allItems.filter(item => {
        const title = getTextFromField(item.title, language).toLowerCase();
        const description = getTextFromField(item.description, language).toLowerCase();
        return title.includes(lowercasedQuery) || description.includes(lowercasedQuery);
    });
  }, [allItems, language]);

  return { allItems, loading, filterItems, loadMore, canLoadMore };
};

    