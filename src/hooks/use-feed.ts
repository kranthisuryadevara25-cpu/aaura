
"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import type { FeedItem } from "@/types/feed";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "@/lib/firebase/provider";

export const useFeed = (pageSize: number = 20) => {
  const [user, loadingAuth] = useAuthState(useAuth());
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  
  const initialLoadDone = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);
    try {
      const result = await getPersonalizedFeed({
        userId: user?.uid,
        pageSize: pageSize,
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
  }, [loading, canLoadMore, user?.uid, pageSize]);
  
  useEffect(() => {
    // This effect should only run once on mount, after auth state is resolved.
    if (!loadingAuth && !initialLoadDone.current) {
        loadMore();
        initialLoadDone.current = true;
    }
  }, [loadingAuth, loadMore]);
  
  return { allItems, loading, loadMore, canLoadMore };
};
