
"use client";
import React, { useEffect, useState, useCallback } from "react";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "@/lib/firebase/provider";

export const useFeed = (initialItems: FeedItem[] | number = [], pageSize: number = 20) => {
  const { language } = useLanguage();
  const [user, loadingAuth] = useAuthState(useAuth());
  const [allItems, setAllItems] = useState<FeedItem[]>(Array.isArray(initialItems) ? initialItems : []);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  
  const initialLoadDone = React.useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);
    try {
      const result = await getPersonalizedFeed({
        userId: user?.uid,
        pageSize: typeof initialItems === 'number' ? initialItems : pageSize,
      });
      
      if (result.feed.length === 0) {
        setCanLoadMore(false);
      } else {
        setAllItems(prevItems => {
            const existingIds = new Set(prevItems.map(item => item.id));
            const newItems = result.feed.filter(newItem => !existingIds.has(newItem.id));
            return [...prevItems, ...newItems];
        });
      }

    } catch (error) {
      console.error("Failed to load more feed items:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, canLoadMore, user?.uid, pageSize, initialItems]);
  
  useEffect(() => {
    if (!loadingAuth && !initialLoadDone.current) {
        if (Array.isArray(initialItems) && initialItems.length === 0) {
            loadMore();
        } else {
            setLoading(false);
        }
        initialLoadDone.current = true;
    }
  }, [loadingAuth, initialItems, loadMore]);
  
  return { allItems, loading, loadMore, canLoadMore };
};
