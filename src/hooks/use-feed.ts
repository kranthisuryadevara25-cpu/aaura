
"use client";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, limit, orderBy, query, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

const mapToFeedItem = (doc: DocumentData, kind: 'video' | 'temple' | 'story' | 'deity'): FeedItem => {
    const data = doc.data();
    switch(kind) {
        case 'video':
             return {
                id: `video-${doc.id}`,
                kind: "video",
                title: data.title_en ? { en: data.title_en, hi: data.title_hi, te: data.title_te } : data.title,
                description: data.description_en ? { en: data.description_en, hi: data.description_hi, te: data.description_te } : data.description,
                thumbnail: data.thumbnailUrl || "",
                mediaUrl: data.mediaUrl,
                meta: { duration: data.duration, views: data.views, userId: data.userId, channelName: data.channelName },
                createdAt: data.uploadDate?.toDate(),
            };
        case 'temple':
             return {
                id: `temple-${doc.id}`,
                kind: "temple",
                title: data.name,
                description: data.importance.mythological,
                thumbnail: data.media?.images?.[0].url,
                meta: { location: data.location, slug: data.slug, imageHint: data.media?.images?.[0]?.hint },
                createdAt: new Date(),
            };
        case 'story':
            return {
                id: `story-${doc.id}`,
                kind: "story",
                title: data.title,
                description: data.summary,
                thumbnail: data.image?.url,
                meta: { slug: data.slug, imageHint: data.image?.hint },
                createdAt: data.createdAt?.toDate(),
            };
        case 'deity':
             return {
                id: `deity-${doc.id}`,
                kind: "deity",
                title: data.name,
                description: data.description,
                thumbnail: data.images?.[0].url,
                meta: { slug: data.slug, imageHint: data.images?.[0]?.hint },
                createdAt: new Date(),
            };
    }
}


export const useFeed = (pageSize = 20) => {
  const { language } = useLanguage();
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);

      const mediaQuery = query(collection(db, "media"), orderBy("uploadDate", "desc"), limit(pageSize));
      const templesQuery = query(collection(db, "temples"), limit(pageSize));
      const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(pageSize));
      const deitiesQuery = query(collection(db, "deities"), limit(pageSize));
      
      const [mediaSnap, templesSnap, storiesSnap, deitiesSnap] = await Promise.all([
        getDocs(mediaQuery),
        getDocs(templesQuery),
        getDocs(storiesQuery),
        getDocs(deitiesQuery),
      ]);

      if (canceled) return;

      const videos: FeedItem[] = mediaSnap.docs.map(d => mapToFeedItem(d, 'video'));
      const templeItems: FeedItem[] = templesSnap.docs.map((d) => mapToFeedItem(d, 'temple'));
      const storyItems: FeedItem[] = storiesSnap.docs.map((d) => mapToFeedItem(d, 'story'));
      const deityItems: FeedItem[] = deitiesSnap.docs.map((d) => mapToFeedItem(d, 'deity'));
      
      const combined = shuffle([...videos, ...templeItems, ...storyItems, ...deityItems]);
      
      setAllItems(combined);
      setLoading(false);
    }

    load();
    return () => {
      canceled = true;
    };
  }, [pageSize]); 

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

  return { allItems, loading, filterItems };
};
