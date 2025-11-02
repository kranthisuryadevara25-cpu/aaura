'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Loader2, Users } from 'lucide-react';
import { Posts } from '@/components/Posts';
import { useMemo } from 'react';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string; 
  const db = useFirestore();

  const groupRef = useMemo(() => doc(db, 'groups', groupId), [db, groupId]);
  const [group, loadingGroup] = useDocumentData(groupRef);
  
  if (loadingGroup) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!group) {
    notFound();
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-primary">{group.name}</h1>
            <p className="mt-2 text-muted-foreground">{group.description}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {group.memberCount || 0} members
            </div>
        </div>
        
        <Posts contextId={groupId} contextType="group" />
      </div>
    </main>
  );
}
