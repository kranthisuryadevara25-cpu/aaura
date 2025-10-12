
'use server';

/**
 * @fileOverview A personalized feed generation flow for the Aaura app.
 * 
 * This flow acts as a server-side function to create a "For You" feed for a given user.
 * It combines user history, content popularity, and recency to generate a scored list of content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// --- Server-Side Firebase Admin Initialization ---
let adminApp: App;
let db: Firestore;

function initializeFirebaseAdmin() {
  if (getApps().some(app => app.name === 'firebase-admin-personalized-feed')) {
    adminApp = getApps().find(app => app.name === 'firebase-admin-personalized-feed')!;
  } else {
    try {
      const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!serviceAccountString) {
        throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
      }
      
      const serviceAccount = JSON.parse(serviceAccountString);

      adminApp = initializeApp(
        {
          credential: cert(serviceAccount),
        },
        'firebase-admin-personalized-feed' // Use a unique name for this instance
      );
    } catch (error: any) {
      console.error('🔥 Firebase Admin SDK initialization failed:', error);
      throw new Error(`Firebase Admin SDK could not be initialized: ${error.message}`);
    }
  }
  db = getFirestore(adminApp);
}

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
    contentId: z.string().describe("The document ID of the content item."),
    contentType: z.enum(['media', 'post', 'story', 'deity', 'temple', 'product']).describe("The type of content, corresponding to a Firestore collection."),
    score: z.number().describe("The relevance score for this item."),
    reason: z.string().describe("A brief explanation for the recommendation."),
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
    initializeFirebaseAdmin(); // Ensure Firebase Admin is initialized
    
    const { userId, pageSize } = input;
    
    if (!userId || await isUserNew(db, userId)) {
        // --- Fallback for New Users / Logged-out users ---
        // For new users, we can't personalize yet. So, we return recent and trending content.
        console.log(`New or logged-out user detected. Returning trending content.`);
        return getTrendingContent(db, pageSize);
    }

    // --- Algorithm for Existing Users ---
    
    // 1. Fetch User Interaction Data (e.g., last 50 interactions)
    const userLikes = await fetchUserInteractions(db, userId, 'likes'); 
    const userBookmarks = await fetchUserInteractions(db, userId, 'bookmarks');

    // 2. Fetch Candidate Content
    const recentMedia = await fetchRecentContent(db, 'media', 50);
    const recentPosts = await fetchRecentContent(db, 'posts', 50);
    const recentStories = await fetchRecentContent(db, 'stories', 50);
    const allCandidates = [...recentMedia, ...recentPosts, ...recentStories];

    // 3. Score Content
    const scoredContent: z.infer<typeof FeedItemSchema>[] = allCandidates.map(item => {
        let score = 0;
        let reason = "Recommended based on recent uploads.";

        // Recency Score (e.g., items from today get a higher base score)
        const hoursSinceCreation = (new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60);
        score += Math.max(0, 10 - Math.floor(hoursSinceCreation / 24)); // Higher score for newer items

        // Engagement Score
        if (userLikes.some(l => l.contentId === item.contentId)) {
            score += 20;
            reason = "You previously liked content like this.";
        }
        if (userBookmarks.some(b => b.contentId === item.contentId)) {
            score += 25;
            reason = "From your bookmarks.";
        }
        
        // Content Type preference
        if(item.contentType === 'media') score += 15; // Prioritize videos
        if(item.contentType === 'post') score += 10; // Then Q&A

        // Popularity/Trending Score (placeholder)
        // In a real app, this would come from an aggregation (e.g., total likes/views in last 24h)
        score += item.popularityScore || 0;
        
        return {
            contentId: item.contentId,
            contentType: item.contentType,
            score,
            reason
        };
    });

    // 4. Sort and Paginate
    const finalFeed = scoredContent
        .sort((a, b) => b.score - a.score) // Sort descending by score
        .filter((_, index) => index < (pageSize || 20)); // Take the top N items

    return { feed: finalFeed };
  }
);


// ---------------------------------------------------
// 4. Helper & Placeholder Functions
// ---------------------------------------------------

/**
 * Placeholder function to check if a user is new.
 */
async function isUserNew(db: Firestore, userId: string): Promise<boolean> {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        // A user is new if they don't have a profile or haven't completed it.
        return !userDoc.exists || !userDoc.data()?.profileComplete;
    } catch {
        return true;
    }
}

/**
 * Placeholder function to get globally trending content for new users.
 */
async function getTrendingContent(db: Firestore, pageSize: number = 20): Promise<PersonalizedFeedOutput> {
    // A real implementation would fetch pre-aggregated trending data.
    // For now, fetch latest media and posts.
    const mediaQuery = db.collection('media').orderBy('uploadDate', 'desc').limit(10);
    const postsQuery = db.collection('posts').orderBy('createdAt', 'desc').limit(10);

    const [mediaSnap, postsSnap] = await Promise.all([
        mediaQuery.get(),
        postsQuery.get()
    ]);
    
    const mediaItems = mediaSnap.docs.map(d => ({
        contentId: d.id,
        contentType: 'media' as const,
        score: 100,
        reason: "Trending on Aaura"
    }));

    const postItems = postsSnap.docs.map(d => ({
        contentId: d.id,
        contentType: 'post' as const,
        score: 90,
        reason: "Popular in the community"
    }));
    
    const feedItems = [...mediaItems, ...postItems].slice(0, pageSize);
    return { feed: feedItems };
}

/**
 * Placeholder to fetch user interactions (likes, bookmarks).
 */
async function fetchUserInteractions(db: Firestore, userId: string, interactionType: 'likes' | 'bookmarks'): Promise<{contentId: string, contentType: string}[]> {
    try {
        const q = db.collection('users').doc(userId).collection(interactionType).limit(50);
        const snap = await q.get();
        // This is a simplified version; a real app might need content type info here
        return snap.docs.map(d => ({ contentId: d.id, contentType: 'unknown' }));
    } catch {
        return [];
    }
}

/**
 * Placeholder to fetch recent content from a collection.
 */
async function fetchRecentContent(
    db: Firestore,
    collectionName: 'media' | 'posts' | 'stories', 
    count: number
): Promise<{contentId: string, contentType: any, createdAt: Date, popularityScore: number}[]> {
    try {
        const dateField = collectionName === 'media' ? 'uploadDate' : 'createdAt';
        const q = db.collection(collectionName).orderBy(dateField, 'desc').limit(count);
        const snap = await q.get();

        return snap.docs.map(d => {
            const data = d.data();
            const popularity = (data.likes || 0) + (data.views || 0) / 10;
            const createdAtTimestamp = data[dateField];
            // Ensure createdAt is a Date object, handling Firestore Timestamps
            const createdAt = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date();

            return {
                contentId: d.id,
                contentType: collectionName,
                createdAt: createdAt,
                popularityScore: popularity
            };
        });
    } catch (e) {
        console.error(`Failed to fetch recent content from ${collectionName}:`, e);
        return [];
    }
}
