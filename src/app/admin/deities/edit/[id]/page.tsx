
'use client';

import { useParams } from 'next/navigation';
import { DeityForm } from '../../../DeityForm';
import { Loader2 } from 'lucide-react';
import { getDeityBySlug } from '@/lib/deities';

export default function EditDeityPage() {
  const params = useParams();
  const { id } = params;

  // In a real app, you'd fetch the deity by ID. Here we find it by slug from mock data.
  // This is a simplification as the mock data doesn't map 1:1 with Firestore IDs.
  const deity = getDeityBySlug(id as string); 
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
        <DeityForm deity={deity} />
    </main>
  );
}
