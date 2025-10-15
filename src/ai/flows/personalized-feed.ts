
'use server';

/**
 * @fileOverview A personalized feed generation flow for the Aaura app.
 * 
 * This flow acts as a server-side function to create a "For You" feed for a given user.
 * It combines user history, content popularity, and recency to generate a scored list of content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase/admin'; 
import type { Firestore, DocumentData } from 'firebase-admin/firestore';
import type { FeedItem } from '@/types/feed';

// ---------------------------------------------------
// 1. Input/Output Schema Definition
// ---------------------------------------------------

const PersonalizedFeedInputSchema = z.object({
  userId: z.string().optional().describe('The UID of the user for whom to generate the feed. If not provided, a generic trending feed is returned.'),
  pageSize: z.number().optional().default(20).describe('The number of items to return.'),
  lastCursor: z.string().optional().describe('The cursor for pagination (not implemented in this version).'),
});
export type PersonalizedFeedInput = z.infer<typeof PersonalizedFeedInputSchema>;

const FeedItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['video', 'temple', 'story', 'deity', 'post', 'media']),
  title: z.record(z.string()).optional(),
  description: z.record(z.string()).optional(),
  thumbnail: z.string().optional(),
  mediaUrl: z.string().optional(),
  meta: z.record(z.any()).optional(),
  createdAt: z.string().optional(), // Using ISO string for serialization
});

const PersonalizedFeedOutputSchema = z.object({
  feed: z.array(FeedItemSchema).describe('The curated list of content items for the user\'s feed.'),
});
export type PersonalizedFeedOutput = z.infer<typeof PersonalizedFeedOutputSchema>;


// ---------------------------------------------------
// 2. Exported "Callable" Function
// ---------------------------------------------------

/**
 * Generates a personalized "For You" feed for a user.
 * 
 * This is the main function the frontend will call. It triggers the Genkit flow.
 *
 * @param input The user ID and pagination options.
 * @returns A promise that resolves to the personalized feed.
 */
export async function getPersonalizedFeed(input: PersonalizedFeedInput): Promise<PersonalizedFeedOutput> {
  return personalizedFeedFlow(input);
}


// ---------------------------------------------------
// 3. The Genkit Flow Implementation
// ---------------------------------------------------

const personalizedFeedFlow = ai.defineFlow(
  {
    name: 'personalizedFeedFlow',
    inputSchema: PersonalizedFeedInputSchema,
    outputSchema: PersonalizedFeedOutputSchema,
  },
  async (input) => {
    const { userId, pageSize } = input;
    
    if (!userId || await isUserNew(db, userId)) {
        console.log(`New or logged-out user detected. Returning trending content.`);
        return getTrendingContent(db, pageSize);
    }

    // --- Optimized Algorithm for Existing Users ---
    
    // Step 2: Parallelize Firestore fetches
    const [userLikes, userBookmarks, recentMedia, recentPosts, recentStories] = await Promise.all([
        fetchUserInteractions(db, userId, 'likes'),
        fetchUserInteractions(db, userId, 'bookmarks'),
        fetchRecentContent(db, 'media', 50),
        fetchRecentContent(db, 'posts', 50),
        fetchRecentContent(db, 'stories', 50)
    ]);
    
    const allCandidates = [...recentMedia, ...recentPosts, ...recentStories];

    const scoredContent = allCandidates.map(item => {
        let score = 0;
        let reason = "Recommended based on recent uploads.";

        const hoursSinceCreation = (new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60);
        score += Math.max(0, 10 - Math.floor(hoursSinceCreation / 24));

        if (userLikes.some(l => l.contentId === item.contentId)) {
            score += 20;
            reason = "You previously liked content like this.";
        }
        if (userBookmarks.some(b => b.contentId === item.contentId)) {
            score += 25;
            reason = "From your bookmarks.";
        }
        
        if(item.contentType === 'media') score += 15;
        if(item.contentType === 'post') score += 10;

        score += item.popularityScore || 0;
        
        return {
            ...item,
            score,
            reason
        };
    });

    const sortedFeed = scoredContent
        .sort((a, b) => b.score - a.score)
        .slice(0, pageSize || 20);

    const finalFeed = sortedFeed.map(item => mapToFeedItem(item.doc, item.contentType as any));

    return { feed: finalFeed.filter((i): i is FeedItem => i !== null) };
  }
);


// ---------------------------------------------------
// 4. Helper & Data Transformation Functions
// ---------------------------------------------------
const mapToFeedItem = (doc: DocumentData, kind: 'video' | 'temple' | 'story' | 'deity' | 'post' | 'media'): FeedItem | null => {
    const data = doc.data();
    if (!data) return null;

    let createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.uploadDate?.toDate ? data.uploadDate.toDate() : new Date());

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
                createdAt: createdAt.toISOString(),
            };
        case 'temple':
             return {
                id: `temple-${doc.id}`,
                kind: "temple",
                title: data.name,
                description: data.importance.mythological,
                thumbnail: data.media?.images?.[0].url,
                meta: { location: data.location, slug: data.slug, imageHint: data.media?.images?.[0]?.hint },
                createdAt: createdAt.toISOString(),
            };
        case 'story':
            return {
                id: `story-${doc.id}`,
                kind: "story",
                title: data.title,
                description: data.summary,
                thumbnail: data.image?.url,
                meta: { slug: data.slug, imageHint: data.image?.hint },
                createdAt: createdAt.toISOString(),
            };
        case 'deity':
             return {
                id: `deity-${doc.id}`,
                kind: "deity",
                title: data.name,
                description: data.description,
                thumbnail: data.images?.[0].url,
                meta: { slug: data.slug, imageHint: data.images?.[0]?.hint },
                createdAt: createdAt.toISOString(),
            };
        case 'post':
            return {
                id: `post-${doc.id}`,
                kind: 'post',
                description: { en: data.content },
                createdAt: createdAt.toISOString(),
                meta: { authorId: data.authorId, likes: data.likes, commentsCount: data.commentsCount, contextId: data.contextId },
            }
        default:
            return null;
    }
}


async function isUserNew(db: Firestore, userId: string): Promise<boolean> {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        return !userDoc.exists || !userDoc.data()?.profileComplete;
    } catch {
        return true;
    }
}

async function getTrendingContent(db: Firestore, pageSize: number = 20): Promise<PersonalizedFeedOutput> {
    const mediaQuery = db.collection('media').orderBy('uploadDate', 'desc').limit(Math.floor(pageSize / 2));
    const postsQuery = db.collection('posts').orderBy('createdAt', 'desc').limit(Math.floor(pageSize / 2));

    const [mediaSnap, postsSnap] = await Promise.all([
        mediaQuery.get(),
        postsQuery.get()
    ]);
    
    const mediaItems = mediaSnap.docs.map(d => mapToFeedItem(d, 'media')).filter(Boolean) as FeedItem[];
    const postItems = postsSnap.docs.map(d => mapToFeedItem(d, 'post')).filter(Boolean) as FeedItem[];
    
    const feedItems = [...mediaItems, ...postItems].slice(0, pageSize);
    return { feed: feedItems };
}

async function fetchUserInteractions(db: Firestore, userId: string, interactionType: 'likes' | 'bookmarks'): Promise<{contentId: string, contentType: string}[]> {
    try {
        const q = db.collection('users').doc(userId).collection(interactionType).limit(50);
        const snap = await q.get();
        return snap.docs.map(d => ({ contentId: d.id, contentType: 'unknown' }));
    } catch {
        return [];
    }
}

async function fetchRecentContent(
    db: Firestore,
    collectionName: 'media' | 'posts' | 'stories', 
    count: number
): Promise<{contentId: string, contentType: any, createdAt: Date, popularityScore: number, doc: DocumentData}[]> {
    try {
        const dateField = collectionName === 'media' ? 'uploadDate' : 'createdAt';
        const q = db.collection(collectionName).orderBy(dateField, 'desc').limit(count);
        const snap = await q.get();

        return snap.docs.map(doc => {
            const data = doc.data();
            const popularity = (data.likes || 0) + (data.views || 0) / 10;
            const createdAtTimestamp = data[dateField];
            const createdAt = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date();

            return {
                contentId: doc.id,
                contentType: collectionName,
                createdAt: createdAt,
                popularityScore: popularity,
                doc: doc
            };
        });
    } catch (e) {
        console.error(`Failed to fetch recent content from ${collectionName}:`, e);
        return [];
    }
}
