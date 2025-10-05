
"use client";
import { useEffect, useMemo, useState } from "react";
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

export const useFeed = (pageSize = 10) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<FeedItem[]>([]);
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
        if (data.title_en) title.en = data.title_en;
        if (data.title_hi) title.hi = data.title_hi;
        if (data.title_te) title.te = data.title_te;
        if (data.title) title.en = data.title; // Fallback

        const description: Record<string, string> = {};
        if (data.description_en) description.en = data.description_en;
        if (data.description_hi) description.hi = data.description_hi;
        if (data.description_te) description.te = data.description_te;
        if(data.description) description.en = data.description; // Fallback

        return {
          id: d.id,
          kind: "video",
          title,
          description,
          thumbnail: data.thumbnailUrl || "",
          mediaUrl: data.mediaUrl,
          meta: { duration: data.duration, views: data.views, userId: data.userId, uploadDate: data.uploadDate },
          createdAt: data.uploadDate,
        } as FeedItem;
      });

      // 2) Map mock temples/stories/deities into FeedItem format
      const templeItems: FeedItem[] = temples.map((t) => ({
        id: t.id,
        kind: "temple",
        title: t.name,
        description: { en: `${t.location.city}, ${t.location.state}` }, // Simple description
        thumbnail: t.media.images[0].url,
        meta: { location: t.location, slug: t.slug, imageHint: t.media.images[0].hint },
      }));

      const storyItems: FeedItem[] = stories.map((s) => ({
        id: s.id,
        kind: "story",
        title: s.title,
        description: s.summary,
        thumbnail: s.image.url,
        meta: { slug: s.slug, imageHint: s.image.hint },
      }));

      const deityItems: FeedItem[] = deities.map((d) => ({
        id: d.id,
        kind: "deity",
        title: d.name,
        description: d.description,
        thumbnail: d.images[0].url,
        meta: { slug: d.slug, imageHint: d.images[0].hint },
      }));

      // 3) Combine & shuffle
      const combined = shuffle([...videos, ...templeItems, ...storyItems, ...deityItems]);
      if (!canceled) {
        setItems(combined);
        setLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [language, pageSize]); 

  return { items, loading };
};
