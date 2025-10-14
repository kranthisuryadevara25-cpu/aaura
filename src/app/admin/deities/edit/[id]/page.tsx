'use client';

import { useParams } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { DeityForm } from '../../../DeityForm';
import { Loader2 } from 'lucide-react';

export default function EditDeityPage() {
  const params = useParams();
  const { id } = params;
  const db = useFirestore();

  const deityRef = doc(db, 'deities', id as string);
  const [deity, isLoading] = useDocumentData(deityRef, { idField: 'id' });

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
