
"use client";
import React from "react";
import { Loader2, FileQuestion } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { FeedItem } from "@/types/feed";

export function Feed({ items, isLoading }: { items: FeedItem[], isLoading: boolean }) {

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
        {items.length > 0 ? (
            items.map((item) => (
                <FeedCard key={item.id} item={item} />
            ))
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

    