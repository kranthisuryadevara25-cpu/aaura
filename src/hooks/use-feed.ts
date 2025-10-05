
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
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

export const useFeed = (pageSize = 20) => {
  const { language } = useLanguage();
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);

      const mediaQuery = query(collection(db, "media"), orderBy("uploadDate", "desc"), limit(pageSize));
      const templesQuery = query(collection(db, 'temples'), limit(pageSize));
      const storiesQuery = query(collection(db, 'stories'), orderBy("createdAt", "desc"), limit(pageSize));
      const deitiesQuery = query(collection(db, 'deities'), limit(pageSize));

      const [mediaSnap, templesSnap, storiesSnap, deitiesSnap] = await Promise.all([
        getDocs(mediaQuery),
        getDocs(templesQuery),
        getDocs(storiesQuery),
        getDocs(deitiesQuery),
      ]);

      if (canceled) return;

      const videos: FeedItem[] = mediaSnap.docs.map((d) => {
        const data = d.data() as any;
        
        const title: Record<string, string> = {};
        if (data.title_en) title.en = data.title_en;
        if (data.title_hi) title.hi = data.title_hi;
        if (data.title_te) title.te = data.title_te;
        if (data.title_mr) title.mr = data.title_mr;
        if (data.title_ta) title.ta = data.title_ta;
        if (data.title_kn) title.kn = data.title_kn;
        if (data.title_bn) title.bn = data.title_bn;
        if (data.title) title.en = data.title;


        const description: Record<string, string> = {};
        if (data.description_en) description.en = data.description_en;
        if (data.description_hi) description.hi = data.description_hi;
        if (data.description_te) description.te = data.description_te;
        if (data.description_mr) description.mr = data.description_mr;
        if (data.description_ta) description.ta = data.description_ta;
        if (data.description_kn) description.kn = data.description_kn;
        if (data.description_bn) description.bn = data.description_bn;
        if (data.description) description.en = data.description;

        return {
          id: `video-${d.id}`,
          kind: "video",
          title: title,
          description: description,
          thumbnail: data.thumbnailUrl || "",
          mediaUrl: data.mediaUrl,
          meta: { duration: data.duration, views: data.views, userId: data.userId, uploadDate: data.uploadDate },
          createdAt: data.uploadDate?.toDate(),
        } as FeedItem;
      });

      const templeItems: FeedItem[] = templesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: `temple-${d.id}`,
            kind: "temple",
            title: {
                en: data.name_en,
                hi: data.name_hi,
            },
            description: {
                en: data.importance?.mythological_en,
                hi: data.importance?.mythological_hi,
            },
            thumbnail: data.media?.images?.[0],
            meta: { location: data.location, slug: data.slug, imageHint: data.media?.images?.[0]?.hint },
            createdAt: new Date(),
        }
      });

      const storyItems: FeedItem[] = storiesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: `story-${d.id}`,
            kind: "story",
            title: {
                en: data.title_en,
                hi: data.title_hi,
            },
            description: {
                en: data.summary_en,
                hi: data.summary_hi,
            },
            thumbnail: data.images?.[0],
            meta: { slug: data.slug, imageHint: data.images?.[0]?.hint },
            createdAt: data.createdAt?.toDate(),
        }
      });

      const deityItems: FeedItem[] = deitiesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: `deity-${d.id}`,
            kind: "deity",
            title: {
                en: data.name_en,
                hi: data.name_hi,
            },
            description: {
                en: data.description_en,
                hi: data.description_hi,
            },
            thumbnail: data.images?.[0],
            meta: { slug: data.slug, imageHint: data.images?.[0]?.hint },
            createdAt: new Date(),
        }
      });

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
