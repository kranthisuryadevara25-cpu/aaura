'use client';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/lib/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// This page is a temporary redirect to handle old links.
// The primary page for viewing a group's posts is [groupId]/page.tsx.
export default function PostRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const postId = params.postId as string;

  const postRef = doc(db, 'posts', postId);
  const [post, loading] = useDocumentData(postRef);

  useEffect(() => {
    if (!loading && post && post.contextId) {
      // Redirect to the group page where the post lives.
      router.replace(`/forum/${post.contextId}`);
    } else if (!loading && !post) {
      // If post doesn't exist, go to the main forum page.
      router.replace('/forum');
    }
  }, [post, loading, router]);

  return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
  );
}
