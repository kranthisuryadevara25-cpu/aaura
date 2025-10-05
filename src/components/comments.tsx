
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, serverTimestamp, query, orderBy, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});

type CommentFormValues = z.infer<typeof commentSchema>;

function CommentCard({ comment, author }: { comment: any; author: any }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-9 w-9">
        <AvatarImage src={author?.photoURL} />
        <AvatarFallback>{author?.displayName?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{author?.displayName || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">
            {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
          </p>
        </div>
        <p className="text-sm mt-1 text-foreground/90">{comment.text}</p>
      </div>
    </div>
  );
}

interface CommentsProps {
  contentId: string;
  contentType: 'media' | 'post';
}

export function Comments({ contentId, contentType }: CommentsProps) {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const commentsQuery = query(collection(db, contentType, contentId, 'comments'), orderBy('createdAt', 'desc'));
  const [comments, commentsLoading] = useCollectionData(commentsQuery, { idField: 'id' });
  
  // This fetches all users, which is not ideal for performance but works for this stage.
  // A better approach would be to fetch only the users who have commented.
  const usersQuery = collection(db, 'users');
  const [usersData, usersLoading] = useCollectionData(usersQuery, { idField: 'id' });

  const usersMap = new Map(usersData?.map(u => [u.id, u]));

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const onSubmitComment = (data: CommentFormValues) => {
    if (!user || !contentId) {
      toast({ variant: 'destructive', title: 'You must be logged in to comment.' });
      return;
    }
    startTransition(async () => {
      try {
        const commentsCollection = collection(db, contentType, contentId, 'comments');
        await addDoc(commentsCollection, {
          contentId: contentId,
          contentType: contentType,
          authorId: user.uid,
          text: data.text,
          createdAt: serverTimestamp(),
        });
        form.reset();
        toast({ title: 'Comment posted!' });
      } catch (error) {
        console.error("Error creating comment:", error);
        toast({ variant: 'destructive', title: 'Failed to post comment.' });
      }
    });
  };

  const isLoading = commentsLoading || usersLoading;

  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-bold mb-4">{t.forum.discussionTitle} ({comments?.length || 0})</h2>

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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.buttons.comment}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-sm text-center text-muted-foreground bg-secondary/50 p-4 rounded-lg mb-8">
            <Link href="/login" className="text-primary underline font-semibold">Log in</Link> to post a comment.
        </div>
      )}


      {isLoading ? (
        <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
            {comments && comments.length > 0 ? (
                comments.map(comment => (
                <CommentCard key={comment.id} comment={comment} author={usersMap.get(comment.authorId)} />
                ))
            ) : (
                <p className="text-muted-foreground text-sm text-center py-4">{t.forum.noComments}</p>
            )}
        </div>
      )}
    </div>
  );
}
