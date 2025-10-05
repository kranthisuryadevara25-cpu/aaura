
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FeedItem } from "@/types/feed";
import { temples } from "@/lib/temples";
import { stories } from "@/lib/stories";
import { deities } from "@/lib/deities";
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

      // 1) Get latest video media items from Firestore (collection "media")
      const mediaQuery = query(collection(db, "media"), orderBy("uploadDate", "desc"), limit(pageSize));
      const mediaSnap = await getDocs(mediaQuery);
      const videos: FeedItem[] = mediaSnap.docs.map((d) => {
        const data = d.data() as any;
        
        const title: Record<string, string> = {};
        if (data.title) title.en = data.title; // legacy fallback
        if (data.title_en) title.en = data.title_en;
        if (data.title_hi) title.hi = data.title_hi;
        if (data.title_te) title.te = data.title_te;
        if (data.title_mr) title.mr = data.title_mr;
        if (data.title_ta) title.ta = data.title_ta;
        if (data.title_kn) title.kn = data.title_kn;
        if (data.title_bn) title.bn = data.title_bn;


        const description: Record<string, string> = {};
        if (data.description) description.en = data.description; // legacy fallback
        if (data.description_en) description.en = data.description_en;
        if (data.description_hi) description.hi = data.description_hi;
        if (data.description_te) description.te = data.description_te;
        if (data.description_mr) description.mr = data.description_mr;
        if (data.description_ta) description.ta = data.description_ta;
        if (data.description_kn) description.kn = data.description_kn;
        if (data.description_bn) description.bn = data.description_bn;

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

      // 2) Map mock temples/stories/deities into FeedItem format
      const templeItems: FeedItem[] = temples.map((t) => ({
        id: `temple-${t.id}`,
        kind: "temple",
        title: t.name,
        description: t.importance.mythological,
        thumbnail: t.media.images[0].url,
        meta: { location: t.location, slug: t.slug, imageHint: t.media.images[0].hint },
        createdAt: new Date(), // Mock date
      }));

      const storyItems: FeedItem[] = stories.map((s) => ({
        id: `story-${s.id}`,
        kind: "story",
        title: s.title,
        description: s.summary,
        thumbnail: s.image.url,
        meta: { slug: s.slug, imageHint: s.image.hint },
        createdAt: new Date(), // Mock date
      }));

      const deityItems: FeedItem[] = deities.map((d) => ({
        id: `deity-${d.id}`,
        kind: "deity",
        title: d.name,
        description: d.description,
        thumbnail: d.images[0].url,
        meta: { slug: d.slug, imageHint: d.images[0].hint },
        createdAt: new Date(), // Mock date
      }));

      // 3) Combine & shuffle
      const combined = shuffle([...videos, ...templeItems, ...storyItems, ...deityItems]);
      if (!canceled) {
        setAllItems(combined);
        setLoading(false);
      }
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
