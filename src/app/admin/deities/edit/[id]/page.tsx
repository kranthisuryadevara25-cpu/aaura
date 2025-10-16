
'use client';

import { useParams, useRouter } from 'next/navigation';
import { DeityForm } from '../../DeityForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDeityBySlug } from '@/lib/deities';

export default function EditDeityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Use local mock data instead of Firestore
  const deity = getDeityBySlug(id);
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
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        <DeityForm deity={deity} />
    </main>
  );
}
