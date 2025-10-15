
"use client";
import { useEffect, useState, useCallback } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";

const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

export const useFeed = (initialItems: FeedItem[] = []) => {
  const { language } = useLanguage();
  const [allItems, setAllItems] = useState<FeedItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  
  useEffect(() => {
    if (initialItems.length > 0) {
      setAllItems(initialItems);
      setLoading(false);
    }
  }, [initialItems]);

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

  // loadMore and canLoadMore can be re-implemented here for client-side pagination if needed
  return { allItems, loading, filterItems, loadMore: () => {}, canLoadMore: false };
};
