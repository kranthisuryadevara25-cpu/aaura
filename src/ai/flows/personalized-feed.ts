
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
    const { pageSize = 20 } = input;
    
    // Step 1: Fetch recent trending content in parallel from multiple collections
    const [mediaItems, postItems, storyItems, templeItems, deityItems] = await Promise.all([
        fetchContent(db, 'media', 'uploadDate', pageSize),
        fetchContent(db, 'posts', 'createdAt', pageSize),
        fetchContent(db, 'stories', 'createdAt', pageSize),
        fetchContent(db, 'temples', 'createdAt', pageSize),
        fetchContent(db, 'deities', 'createdAt', pageSize),
    ]);

    // Step 2: Combine and shuffle the content for variety
    const combinedFeed = [...mediaItems, ...postItems, ...storyItems, ...templeItems, ...deityItems];
    const shuffledFeed = combinedFeed.sort(() => 0.5 - Math.random());
    
    // Step 3: Slice to the desired page size
    const finalFeed = shuffledFeed.slice(0, pageSize);
    
    return { feed: finalFeed };
  }
);


// ---------------------------------------------------
// 4. Helper & Data Transformation Functions
// ---------------------------------------------------
const mapToFeedItem = (doc: DocumentData, kind: FeedItem['kind']): FeedItem | null => {
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
                mediaUrl: data.mediaUrl || "",
                meta: { duration: data.duration, views: data.views, userId: data.userId, channelName: data.channelName, likes: data.likes },
                createdAt: createdAt.toISOString(),
            };
        case 'temple':
             return {
                id: `temple-${doc.id}`,
                kind: "temple",
                title: data.name,
                description: data.importance?.mythological,
                thumbnail: data.media?.images?.[0]?.url,
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
                meta: { authorId: data.authorId, likes: data.likes, commentsCount: data.commentsCount, contextId: data.contextId, contextType: data.contextType },
            }
        default:
            return null;
    }
}

async function fetchContent(db: Firestore, collectionName: string, dateField: string, limit: number): Promise<FeedItem[]> {
    try {
        const q = db.collection(collectionName).orderBy(dateField, 'desc').limit(limit);
        const snapshot = await q.get();
        return snapshot.docs
            .map(doc => mapToFeedItem(doc, collectionName as any))
            .filter((item): item is FeedItem => item !== null);
    } catch (e) {
        console.error(`Failed to fetch content from ${collectionName}:`, e);
        return [];
    }
}
