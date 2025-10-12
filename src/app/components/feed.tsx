
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileQuestion } from 'lucide-react';
import { PostCard } from "@/app/forum/page";
import sampleFeed from '@/lib/sample-feed.json';

type FeedItem = {
    id: string;
    type: 'media' | 'post' | 'story' | 'deity' | 'temple' | 'video';
    data: DocumentData;
};

export function Feed({ searchQuery }: { searchQuery: string }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        // If user is not logged in, use sample data to avoid Firestore permission errors
        if (!user) {
            console.log("No user logged in. Falling back to sample feed.");
            const dummyItems = sampleFeed.feed.map(item => ({
                id: item.id,
                type: item.type as any,
                data: {
                    title_en: item.title,
                    description_en: (item as any).summary || (item as any).location,
                    thumbnailUrl: item.image?.url,
                    views: item.engagement?.views,
                    likes: item.engagement?.likes,
                    commentsCount: item.engagement?.comments,
                    userId: (item as any).author?.name,
                    ...item
                }
            }));
            setFeedItems(dummyItems as FeedItem[]);
            setLoading(false);
            return;
        }

        const personalizedFeed = await getPersonalizedFeed({ userId: user?.uid });
        if (personalizedFeed.feed.length > 0) {
            const itemPromises = personalizedFeed.feed.map(async (item) => {
              const itemDoc = await getDoc(doc(db, item.contentType, item.contentId));
              if (itemDoc.exists()) {
                return { id: itemDoc.id, type: item.contentType as FeedItem['type'], data: itemDoc.data() };
              }
              return null;
            });
            const items = (await Promise.all(itemPromises)).filter(Boolean) as FeedItem[];
            setFeedItems(items);
        } else {
            // Fallback to dummy data if feed is empty
            const dummyItems = sampleFeed.feed.map(item => ({
                id: item.id,
                type: item.type as any,
                data: {
                    title_en: item.title,
                    description_en: (item as any).summary || (item as any).location,
                    thumbnailUrl: item.image?.url,
                    views: item.engagement?.views,
                    likes: item.engagement?.likes,
                    commentsCount: item.engagement?.comments,
                    userId: (item as any).author?.name, // Not ideal, but for visual representation
                    ...item
                }
            }));
            setFeedItems(dummyItems as FeedItem[]);
        }
      } catch (error) {
        console.error("Failed to fetch personalized feed:", error);
        // Fallback to sample data on error
         const dummyItems = sampleFeed.feed.map(item => ({
            id: item.id,
            type: item.type as any,
            data: {
                title_en: item.title,
                description_en: (item as any).summary || (item as any).location,
                thumbnailUrl: item.image?.url,
                views: item.engagement?.views,
                likes: item.engagement?.likes,
                commentsCount: item.engagement?.comments,
                userId: (item as any).author?.name,
                ...item
            }
        }));
        setFeedItems(dummyItems as FeedItem[]);
      } finally {
        setLoading(false);
      }
    };
    
    // Do not fetch feed until auth state is determined
    if (!authLoading) {
        fetchFeed();
    }

  }, [user, authLoading, db]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return feedItems;
    const lowercasedQuery = searchQuery.toLowerCase();
    return feedItems.filter(item => {
        const title = item.data.title_en || item.data.name_en || item.data.content || '';
        const description = item.data.description_en || item.data.summary_en || '';
        return title.toLowerCase().includes(lowercasedQuery) || description.toLowerCase().includes(lowercasedQuery);
    });
  }, [searchQuery, feedItems]);
  
  if (loading || authLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
        {filteredItems.length > 0 ? (
            filteredItems.map(({id, type, data}) => {
                if (type === 'post') {
                    // This uses a different structure, so we pass the whole object
                    const postObject = {
                        id: id,
                        authorId: data.authorId,
                        content: data.content,
                        createdAt: data.createdAt,
                        likes: data.likes,
                        commentsCount: data.commentsCount,
                    };
                    return <PostCard key={id} post={postObject} />
                }
                // Use FeedCard for all other types, as it can handle them.
                return <FeedCard key={id} item={{...data, id: id, type: type}} />
            })
        ) : (
             <div className="flex justify-center items-center h-96">
                <Alert className="max-w-md text-center">
                  <FileQuestion className="h-4 w-4" />
                  <AlertTitle>No Content Found</AlertTitle>
                  <AlertDescription>
                    We couldn't find any content for your feed right now. Why not create a post?
                  </AlertDescription>
                </Alert>
            </div>
        )}
    </>
  );
}
