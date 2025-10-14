
"use client";
import React, { useMemo } from "react";
import { Loader2, FileQuestion } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, limit, where, DocumentData } from 'firebase/firestore';
import { useFirestore } from "@/lib/firebase/provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PostCard } from "@/app/forum/page";

type FeedItem = {
    id: string;
    type: 'media' | 'post' | 'story' | 'deity' | 'temple' | 'video';
    data: DocumentData;
};

export function Feed({ searchQuery }: { searchQuery: string }) {
  const db = useFirestore();
  
  const mediaQuery = query(collection(db, 'media'), where('status', '==', 'approved'), orderBy('uploadDate', 'desc'), limit(15));
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));

  const [mediaItems, mediaLoading] = useCollectionData(mediaQuery, { idField: 'id' });
  const [postItems, postsLoading] = useCollectionData(postsQuery, { idField: 'id' });
  
  const combinedFeed = useMemo(() => {
    const media = (mediaItems || []).map(item => ({...item, type: 'media'}));
    const posts = (postItems || []).map(item => ({...item, type: 'post'}));

    // Simple combination and sorting by date. A more complex algorithm could be used here.
    const allItems = [...media, ...posts];
    allItems.sort((a, b) => {
        const dateA = a.uploadDate?.toDate() || a.createdAt?.toDate();
        const dateB = b.uploadDate?.toDate() || b.createdAt?.toDate();
        return dateB - dateA;
    });

    return allItems;
  }, [mediaItems, postItems]);


  const filteredItems = useMemo(() => {
    if (!searchQuery) return combinedFeed;
    const lowercasedQuery = searchQuery.toLowerCase();

    return combinedFeed.filter(item => {
        const title = item.title_en || item.content || '';
        const description = item.description_en || '';
        return title.toLowerCase().includes(lowercasedQuery) || description.toLowerCase().includes(lowercasedQuery);
    });
  }, [searchQuery, combinedFeed]);
  
  const isLoading = mediaLoading || postsLoading;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
        {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
                if (item.type === 'post') {
                    // This uses a different structure, so we pass the whole object
                    return <PostCard key={item.id} post={item} />
                }
                // Use FeedCard for all other types, as it can handle them.
                return <FeedCard key={item.id} item={item} />
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
