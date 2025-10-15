
// app/reels/page.tsx
import { getTrendingContent } from '@/ai/flows/personalized-feed';
import { db } from '@/lib/firebase/admin';
import ReelsClient from './ReelsClient';

export const revalidate = 60; // cache SSR for 1 minute

export default async function ReelsPage() {
  const trendingFeed = await getTrendingContent(db, 10); // lightweight prefetch
  const initialVideos = trendingFeed.feed.filter(item => item.kind === 'video');
  return <ReelsClient initialVideos={initialVideos} />;
}
