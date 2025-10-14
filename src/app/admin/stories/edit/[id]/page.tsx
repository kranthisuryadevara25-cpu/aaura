
'use client';

import { useParams } from 'next/navigation';
import { StoryForm } from '../../StoryForm';
import { Loader2 } from 'lucide-react';
import { getStoryBySlug } from '@/lib/stories';

export default function EditStoryPage() {
  const params = useParams();
  const id = params.id as string;

  const story = getStoryBySlug(id);
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <StoryForm story={story} />
    </main>
  );
}
