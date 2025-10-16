
// app/reels/page.tsx
import { db } from '@/lib/firebase/admin';
import ReelsClient from './ReelsClient';
import type { FeedItem } from '@/types/feed';
import type { DocumentData } from 'firebase-admin/firestore';

export const revalidate = 0; // Disable caching for dynamic content
export const dynamic = 'force-dynamic';

const mapToFeedItem = (doc: DocumentData): FeedItem | null => {
    const data = doc.data();
    if (!data) return null;

    return {
        id: `media-${doc.id}`,
        kind: "video",
        title: data.title_en ? { en: data.title_en, hi: data.title_hi, te: data.title_te } : data.title,
        description: data.description_en ? { en: data.description_en, hi: data.description_hi, te: data.description_te } : data.description,
        thumbnail: data.thumbnailUrl || "",
        mediaUrl: data.mediaUrl,
        meta: { duration: data.duration, views: data.views, userId: data.userId, channelName: data.channelName, likes: data.likes },
        createdAt: data.uploadDate?.toDate().toISOString(),
    };
}


async function getInitialVideos() {
    try {
        const mediaQuery = db.collection('media').where('mediaType', 'in', ['video', 'short']).where('status', '==', 'approved').orderBy('uploadDate', 'desc').limit(5);
        const snapshot = await mediaQuery.get();
        const videos = snapshot.docs.map(doc => mapToFeedItem(doc)).filter((i): i is FeedItem => i !== null);
        return videos;
    } catch (error) {
        console.error("Failed to fetch initial videos:", error);
        return [];
    }
}


export default async function ReelsPage() {
  const initialVideos = await getInitialVideos();
  return <ReelsClient initialVideos={initialVideos} />;
}
