
"use client";
import { useEffect, useState, useCallback } from "react";
import { collection, getDoc, doc, DocumentData } from "firebase/firestore";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import type { FeedItem } from "@/types/feed";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";


const getTextFromField = (field: Record<string, string> | string | undefined, lang: string): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || "";
};

const mapToFeedItem = (doc: DocumentData, kind: 'video' | 'temple' | 'story' | 'deity' | 'post' | 'media'): FeedItem => {
    const data = doc.data();
    switch(kind) {
        case 'video':
        case 'media':
             return {
                id: `media-${doc.id}`,
                kind: "video",
                title: data.title_en ? { en: data.title_en, hi: data.title_hi, te: data.title_te } : data.title,
                description: data.description_en ? { en: data.description_en, hi: data.description_hi, te: data.description_te } : data.description,
                thumbnail: data.thumbnailUrl || "",
                mediaUrl: data.mediaUrl,
                meta: { duration: data.duration, views: data.views, userId: data.userId, channelName: data.channelName, likes: data.likes },
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
        case 'post':
            return {
                id: `post-${doc.id}`,
                kind: 'post',
                description: { en: data.content },
                createdAt: data.createdAt?.toDate(),
                meta: { authorId: data.authorId, likes: data.likes, commentsCount: data.commentsCount, contextId: data.contextId },
            }
    }
}


export const useFeed = (pageSize = 20) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [lastCursor, setLastCursor] = useState<string | undefined>(undefined);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);

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
    
    const feedDocs = await Promise.all(
        feedResponse.feed.map(item => getDoc(doc(db, item.contentType, item.contentId)))
    );

    const newItems = feedDocs
      .map((doc, i) => {
          if (!doc.exists()) return null;
          const contentType = feedResponse.feed[i].contentType;
           if (['temple', 'deity', 'story', 'media', 'post'].includes(contentType)) {
               return mapToFeedItem(doc, contentType as any);
          }
          return null;
      })
      .filter((item): item is FeedItem => item !== null);

    setAllItems(prev => [...prev, ...newItems]);
    // The AI flow doesn't support cursors yet, so we prevent further loading for now.
    setCanLoadMore(false); 
    // setLastCursor(newCursor); 

    setLoading(false);
  }, [loading, canLoadMore, user, pageSize, lastCursor, db]);

  useEffect(() => {
    loadMore();
  }, []); // Initial load

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
