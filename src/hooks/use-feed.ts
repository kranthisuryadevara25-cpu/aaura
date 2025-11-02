
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { FeedItem } from "@/types/feed";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "@/lib/firebase/provider";

export const useFeed = (pageSize: number = 20) => {
  const [user, authLoading] = useAuthState(useAuth());
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const loadInitialFeed = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const result = await getPersonalizedFeed({
        userId: user?.uid,
        pageSize: pageSize,
      });

      if (result.feed.length < pageSize) {
        setCanLoadMore(false);
      }
      setAllItems(result.feed);
    } catch (error) {
      console.error("Failed to load initial feed items:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user, pageSize]);

  useEffect(() => {
    if (!authLoading) {
        loadInitialFeed();
    }
  }, [authLoading, loadInitialFeed]);


  const loadMore = useCallback(async () => {
    if (loadingRef.current || !canLoadMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await getPersonalizedFeed({
        userId: user?.uid,
        pageSize: pageSize,
      });
      
      if (result.feed.length < pageSize) {
        setCanLoadMore(false);
      }
      
      setAllItems(prevItems => {
          const existingIds = new Set(prevItems.map(item => item.id));
          const newItems = result.feed.filter(newItem => !existingIds.has(newItem.id));
          return [...prevItems, ...newItems];
      });

      pageRef.current += 1;

    } catch (error) {
      console.error("Failed to load more feed items:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [canLoadMore, user, pageSize]);
  
  return { allItems, loading, loadMore, canLoadMore };
};
