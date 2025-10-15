
"use client";
import { useEffect, useState, useCallback } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "@/lib/firebase/provider";

const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

export const useFeed = (initialItems: FeedItem[] = [], pageSize: number = 20) => {
  const { language } = useLanguage();
  const [auth] = useAuthState(useAuth());
  const [allItems, setAllItems] = useState<FeedItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);
    try {
      const result = await getPersonalizedFeed({
        userId: auth?.uid,
        pageSize: pageSize,
        // In a real app, you'd pass a cursor from the last item of `allItems`
      });
      
      if (result.feed.length === 0) {
        setCanLoadMore(false);
      } else {
        // Prevent duplicates
        const newItems = result.feed.filter(newItem => !allItems.some(existingItem => existingItem.id === newItem.id));
        setAllItems(prevItems => [...prevItems, ...newItems]);
      }

    } catch (error) {
      console.error("Failed to load more feed items:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, canLoadMore, auth?.uid, pageSize, allItems]);
  
  // If there are no initial items, load the first batch.
  useEffect(() => {
    if (initialItems.length === 0) {
      loadMore();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
