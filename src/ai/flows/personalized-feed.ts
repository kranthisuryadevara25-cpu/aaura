'use server';

/**
 * @fileOverview A personalized feed generation flow for the Aaura app.
 * 
 * This flow acts as a server-side function to create a "For You" feed for a given user.
 * It combines user history, content popularity, and recency to generate a scored list of content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ---------------------------------------------------
// 1. Input/Output Schema Definition
// ---------------------------------------------------

const PersonalizedFeedInputSchema = z.object({
  userId: z.string().describe('The UID of the user for whom to generate the feed.'),
  pageSize: z.number().optional().default(20).describe('The number of items to return.'),
  lastCursor: z.string().optional().describe('The cursor for pagination (not implemented in this version).'),
});
export type PersonalizedFeedInput = z.infer<typeof PersonalizedFeedInputSchema>;

const FeedItemSchema = z.object({
    contentId: z.string().describe("The document ID of the content item."),
    contentType: z.enum(['temple', 'deity', 'story', 'media', 'post', 'product']).describe("The type of content, corresponding to a Firestore collection."),
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
    // In a production app, you would connect to Firestore here to fetch real data.
    // For this blueprint, we'll use placeholder logic and mock data.

    const { userId, pageSize } = input;
    const isNewUser = await isUserNew(userId);

    if (isNewUser) {
        // --- Fallback for New Users ---
        // For new users, we can't personalize yet. So, we return recent and trending content.
        console.log(`New user detected (${userId}). Returning trending content.`);
        return getTrendingContent(pageSize);
    }

    // --- Algorithm for Existing Users ---
    
    // 1. Fetch User Interaction Data (e.g., last 50 interactions)
    //    - In a real app, query subcollections like /users/{userId}/likes, /users/{userId}/bookmarks
    const userLikes = await fetchUserInteractions(userId, 'likes'); // e.g., returns [{contentId: 'ram-mandir', contentType: 'temple'}, ...]
    const userBookmarks = await fetchUserInteractions(userId, 'bookmarks');

    // 2. Fetch Candidate Content
    //    - Get the latest N items from various collections.
    const recentTemples = await fetchRecentContent('temples', 50);
    const recentStories = await fetchRecentContent('stories', 50);
    const recentMedia = await fetchRecentContent('media', 50);
    const allCandidates = [...recentTemples, ...recentStories, ...recentMedia];

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
            reason = "You previously liked this.";
        }
        if (userBookmarks.some(b => b.contentId === item.contentId)) {
            score += 25;
            reason = "You previously bookmarked this.";
        }

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
        .slice(0, pageSize); // Take the top N items

    return { feed: finalFeed };
  }
);


// ---------------------------------------------------
// 4. Helper & Placeholder Functions
// ---------------------------------------------------

/**
 * Placeholder function to check if a user is new.
 * In a real app, this would check their creation date or interaction count.
 */
async function isUserNew(userId: string): Promise<boolean> {
    // A real implementation would query Firestore:
    // const userDoc = await getDoc(doc(db, 'users', userId));
    // return !userDoc.exists() || userDoc.data().interactionCount < 5;
    return userId === 'new-user'; // Simulate for demonstration
}

/**
 * Placeholder function to get globally trending content for new users.
 */
async function getTrendingContent(pageSize: number): Promise<PersonalizedFeedOutput> {
    // A real implementation would fetch pre-aggregated trending data.
    const trendingItems = [
        { contentId: 'ram-mandir-ayodhya', contentType: 'temple', score: 100, reason: "Trending in your region." },
        { contentId: 'diwali', contentType: 'festival', score: 95, reason: "Upcoming festival." },
        { contentId: 'ramayana-summary', contentType: 'story', score: 90, reason: "Popular story." },
    ].slice(0, pageSize) as z.infer<typeof FeedItemSchema>[];
    
    return { feed: trendingItems };
}

/**
 * Placeholder to fetch user interactions (likes, bookmarks).
 */
async function fetchUserInteractions(userId: string, interactionType: 'likes' | 'bookmarks'): Promise<{contentId: string, contentType: string}[]> {
    // In Firestore: query(collection(db, 'users', userId, interactionType), orderBy('timestamp', 'desc'), limit(50))
    if (interactionType === 'likes') {
        return [{ contentId: 'ram-mandir-ayodhya', contentType: 'temple' }];
    }
    return [];
}

/**
 * Placeholder to fetch recent content from a collection.
 */
async function fetchRecentContent(collectionName: z.infer<typeof FeedItemSchema>["contentType"], limit: number): Promise<{contentId: string, contentType: any, createdAt: Date, popularityScore: number}[]> {
    // In Firestore: query(collection(db, collectionName), orderBy('createdAt', 'desc'), limit(limit))
    return [
        { contentId: `ram-mandir-ayodhya`, contentType: 'temple', createdAt: new Date(), popularityScore: 15 },
        { contentId: `story-123`, contentType: 'story', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), popularityScore: 5 },
        { contentId: `media-456`, contentType: 'media', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), popularityScore: 8 },
    ];
}
