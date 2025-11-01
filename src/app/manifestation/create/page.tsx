
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  technique: z.string().min(20, "Please describe the technique in at least 20 characters."),
  results: z.string().optional(),
  tags: z.string().min(3, "Please add at least one tag."),
  imageUrl: z.string().url("Please provide a valid image URL.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;


export default function CreateManifestationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [user] = useAuthState(useAuth());
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      technique: '',
      results: '',
      tags: '',
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to post.' });
        return;
    }
    startTransition(async () => {
      const manifestationsCollection = collection(db, 'manifestations');
      const postData = {
          userId: user.uid,
          title: data.title,
          technique: data.technique,
          results: data.results || null,
          tags: data.tags.split(',').map(tag => tag.trim()),
          imageUrl: data.imageUrl || null,
          createdAt: serverTimestamp(),
          likesCount: 0,
          commentsCount: 0,
      };
      
      try {
        const docRef = await addDoc(manifestationsCollection, postData);
        await updateDoc(docRef, { id: docRef.id });

        toast({ 
          title: 'Manifestation Shared!', 
          description: 'Your story has been added to the hub.' 
        });
        router.push('/manifestation');
      } catch (error) {
         const permissionError = new FirestorePermissionError({
            path: manifestationsCollection.path,
            operation: 'create',
            requestResourceData: postData,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
             <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Manifestation Hub
            </Button>
            <Card className="w-full">
            <CardHeader>
                <CardTitle>Share Your Manifestation</CardTitle>
                <CardDescription>Inspire others by sharing the techniques, methods, and results of your manifestation journey.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="E.g., How I manifested my dream vacation" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="technique" render={({ field }) => (
                        <FormItem><FormLabel>Technique/Method</FormLabel><FormControl><Textarea placeholder="Describe the step-by-step method you used. For example, the 369 method, visualization, scripting, etc." {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                    )} />

                     <FormField control={form.control} name="results" render={({ field }) => (
                        <FormItem><FormLabel>Results (Optional)</FormLabel><FormControl><Textarea placeholder="Share the outcome of your practice. What happened?" {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                     <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="abundance, scripting, gratitude" {...field} /></FormControl><FormDescription>Comma-separated keywords to help others find your post.</FormDescription><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Share My Story
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
    </main>
  );
}
