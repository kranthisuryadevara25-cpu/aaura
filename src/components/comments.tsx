
'use client';

import { useTransition, useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, serverTimestamp, query, orderBy, addDoc, updateDoc, doc, increment, DocumentData, WithFieldValue } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { Skeleton } from './ui/skeleton';
import { ClientOnlyTime } from './ClientOnlyTime';


const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});

type CommentFormValues = z.infer<typeof commentSchema>;

function CommentAuthor({ authorId }: { authorId: string }) {
    const db = useFirestore();
    const authorRef = useMemo(() => authorId && db ? doc(db, 'users', authorId) : undefined, [db, authorId]);
    const [author, loading] = useDocumentData(authorRef);

    if (loading) {
        return (
             <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
        );
    }
    
    if (!author) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm text-muted-foreground">Unknown User</p>
        </div>
      );
    }

    return (
        <Link href={`/profile/${authorId}`} className="flex items-center gap-2 group">
            <Avatar className="h-9 w-9">
                <AvatarImage src={author?.photoURL} />
                <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm group-hover:text-primary transition-colors">{author?.displayName || 'Anonymous User'}</p>
        </Link>
    )
}

function CommentCard({ comment }: { comment: any; }) {
  const createdAtDate = comment.createdAt?.toDate ? comment.createdAt.toDate() : undefined;
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50">
      <div className="w-full">
        <div className="flex items-center justify-between">
            <CommentAuthor authorId={comment.authorId} />
          <p className="text-xs text-muted-foreground">
            <ClientOnlyTime date={createdAtDate} />
          </p>
        </div>
        <p className="text-sm mt-2 text-foreground/90 pl-11">{comment.text}</p>
      </div>
    </div>
  );
}

interface CommentsProps {
  contentId: string;
  contentType: 'media' | 'post' | 'manifestation';
}

export function Comments({ contentId, contentType }: CommentsProps) {
  const [user] = useAuthState(useAuth());
  const db = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();
  const [optimisticComments, setOptimisticComments] = useState<DocumentData[]>([]);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const commentsCollectionName = useMemo(() => {
      if(contentType === 'media') return 'media';
      return `${contentType}s`;
  }, [contentType]);

  const commentsQuery = useMemo(() => {
      if (!db || !contentId || !commentsCollectionName) return undefined;
      const commentsCollectionRef = collection(db, `${commentsCollectionName}/${contentId}/comments`);
      return query(commentsCollectionRef, orderBy('createdAt', 'desc'));
  }, [db, commentsCollectionName, contentId]);
  
  const [comments, commentsLoading] = useCollectionData(commentsQuery, { idField: 'id' });

  useEffect(() => {
    if (comments) {
        setOptimisticComments(comments);
    }
  }, [comments]);


  const onSubmitComment = (data: CommentFormValues) => {
    if (!user || !contentId) {
      toast({ variant: 'destructive', title: 'You must be logged in to comment.' });
      return;
    }

    startTransition(async () => {
        const commentsCollectionRef = collection(db, `${commentsCollectionName}/${contentId}/comments`);
        const commentData: WithFieldValue<DocumentData> = {
          contentId,
          contentType: contentType,
          authorId: user.uid,
          text: data.text,
          createdAt: serverTimestamp(),
        };

        const tempId = `temp-${Date.now()}`;
        const tempComment = {
            ...commentData,
            id: tempId,
            createdAt: { toDate: () => new Date() },
            authorId: user.uid,
        };
        
        setOptimisticComments(prev => [tempComment, ...prev]);
        form.reset();

        try {
            await addDoc(commentsCollectionRef, commentData);
            
            const parentDocRef = doc(db, commentsCollectionName, contentId);
            await updateDoc(parentDocRef, {
                commentsCount: increment(1)
            });

        } catch (serverError) {
             setOptimisticComments(prev => prev.filter(c => c.id !== tempId)); // Rollback on error
             const permissionError = new FirestorePermissionError({
                path: commentsCollectionRef.path,
                operation: 'create',
                requestResourceData: commentData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-bold mb-4">{t.forum.discussionTitle} ({optimisticComments?.length || 0})</h2>

      {user ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitComment)} className="flex items-start gap-4 mb-8">
            <Avatar className="h-10 w-10 mt-1">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      placeholder={t.forum.commentPlaceholder}
                      className="resize-none"
                      rows={1}
                      onFocus={(e) => e.target.rows = 3}
                      onBlur={(e) => e.target.rows = 1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {t.buttons.comment}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-sm text-center text-muted-foreground bg-secondary/50 p-4 rounded-lg mb-8">
            <Link href="/login" className="text-primary underline font-semibold">Log in</Link> to post a comment.
        </div>
      )}


      {commentsLoading && optimisticComments.length === 0 ? (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
            {optimisticComments && optimisticComments.length > 0 ? (
                optimisticComments.map((comment, index) => (
                <CommentCard key={comment.id || index} comment={comment} />
                ))
            ) : (
                <p className="text-muted-foreground text-sm text-center py-4">{t.forum.noComments}</p>
            )}
        </div>
      )}
    </div>
  );
}
