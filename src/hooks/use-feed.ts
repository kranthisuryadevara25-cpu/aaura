
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

const mapToFeedItem = (doc: DocumentData, kind: 'video' | 'temple' | 'story' | 'deity' | 'post'): FeedItem => {
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
                meta: { authorId: data.authorId, likes: data.likes, commentsCount: data.commentsCount },
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

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);

      const feedResponse = await getPersonalizedFeed({ userId: user?.uid, pageSize });
      
      if (canceled) return;

      const feedDocs = await Promise.all(
          feedResponse.feed.map(item => getDoc(doc(db, item.contentType, item.contentId)))
      );
      
      if (canceled) return;

      const mappedItems = feedDocs
        .map((doc, i) => {
            if (!doc.exists()) return null;
            const contentType = feedResponse.feed[i].contentType;
            if (contentType === 'temple' || contentType === 'deity' || contentType === 'story' || contentType === 'media' || contentType === 'post') {
                 return mapToFeedItem(doc, contentType as 'temple' | 'deity' | 'story' | 'media' | 'post');
            }
            return null;
        })
        .filter((item): item is FeedItem => item !== null);

      setAllItems(mappedItems);
      setLoading(false);
    }

    load();
    return () => {
      canceled = true;
    };
  }, [user, pageSize, db]); 

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
