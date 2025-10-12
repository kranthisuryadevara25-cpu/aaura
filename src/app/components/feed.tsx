
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedCard } from "@/components/FeedCard";
import { useLanguage } from "@/hooks/use-language";
import { getPersonalizedFeed } from "@/ai/flows/personalized-feed";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileQuestion } from 'lucide-react';
import { PostCard } from "@/app/forum/page";

type FeedItem = {
    id: string;
    type: 'media' | 'post' | 'story' | 'deity' | 'temple';
    data: DocumentData;
};

export function Feed({ searchQuery }: { searchQuery: string }) {
  const [user] = useAuthState(auth);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const personalizedFeed = await getPersonalizedFeed({ userId: user?.uid });
        const itemPromises = personalizedFeed.feed.map(async (item) => {
          const itemDoc = await getDoc(doc(db, item.contentType, item.contentId));
          if (itemDoc.exists()) {
            return { id: itemDoc.id, type: item.contentType, data: itemDoc.data() };
          }
          return null;
        });
        const items = (await Promise.all(itemPromises)).filter(Boolean) as FeedItem[];
        setFeedItems(items);
      } catch (error) {
        console.error("Failed to fetch personalized feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return feedItems;
    const lowercasedQuery = searchQuery.toLowerCase();
    return feedItems.filter(item => {
        const title = item.data.title_en || item.data.name_en || item.data.content || '';
        const description = item.data.description_en || item.data.summary_en || '';
        return title.toLowerCase().includes(lowercasedQuery) || description.toLowerCase().includes(lowercasedQuery);
    });
  }, [searchQuery, feedItems]);
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
        <div className="flex justify-center items-center h-96">
            <Alert className="max-w-md text-center">
              <FileQuestion className="h-4 w-4" />
              <AlertTitle>No Content Found</AlertTitle>
              <AlertDescription>
                We couldn't find any content for your feed right now. Try uploading media or exploring other sections!
              </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
        {filteredItems.map(({id, type, data}) => {
            if (type === 'media') {
                 return <FeedCard key={id} item={{...data, id: id}} />
            }
            if (type === 'post') {
                return <PostCard key={id} post={{...data, id: id}} authorId={data.authorId} />
            }
            // Add renderers for other types like story, deity etc. if needed
            return null;
        })}
    </div>
  );
}
