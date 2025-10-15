
"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed as getPersonalizedFeedFlow } from "@/ai/flows/personalized-feed";

const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

export const useFeed = (initialItems: FeedItem[] = [], pageSize = 20) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const [allItems, setAllItems] = useState<FeedItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);
    try {
        const feedResponse = await getPersonalizedFeedFlow({ 
            userId: user?.uid, 
            pageSize,
        });

        if (feedResponse.feed.length === 0) {
            setCanLoadMore(false);
        } else {
            setAllItems(prev => {
                const existingIds = new Set(prev.map(item => item.id));
                const uniqueNewItems = feedResponse.feed.filter(item => !existingIds.has(item.id));
                return [...prev, ...uniqueNewItems];
            });
        }
    } catch (error) {
        console.error("Failed to fetch personalized feed:", error);
        setCanLoadMore(false); // Stop trying if there's an error
    } finally {
        setLoading(false);
    }
  }, [loading, canLoadMore, user, pageSize]);


  useEffect(() => {
    // This effect is now primarily for the Reels page or other client-side feeds.
    // The main feed is server-rendered.
    if (initialItems.length === 0 && allItems.length === 0) {
        loadMore();
    } else {
      setLoading(false);
    }
  }, [initialItems, allItems, loadMore]);


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
