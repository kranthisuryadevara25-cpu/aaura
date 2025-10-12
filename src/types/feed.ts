
export type FeedKind = "video" | "temple" | "story" | "deity" | "post";

export type FeedItem = {
  id: string;
  kind: FeedKind;
  title?: Record<string, string>;      // per-language title e.g. { en: 'x', te: 'y' }
  description?: Record<string, string>;
  thumbnail?: string;
  mediaUrl?: string;                   // for video items
  meta?: Record<string, any>;          // e.g., views, duration, templeLocation etc.
  createdAt?: any;
};
