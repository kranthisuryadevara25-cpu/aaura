'use client';

import { useState, useTransition } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Upload } from 'lucide-react';
import { Header } from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { moderateContent } from '@/ai/ai-content-moderation';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  video: z.instanceof(FileList).refine((files) => files?.length === 1, 'Video is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register('video');

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to upload.' });
      return;
    }

    startTransition(async () => {
      try {
        const videoFile = data.video[0];
        const videoDataUri = await toBase64(videoFile);
        
        // Moderate content
        const moderationResult = await moderateContent({
          videoDataUri,
          title: data.title,
          description: data.description,
        });

        if (!moderationResult.isAppropriate) {
          toast({
            variant: 'destructive',
            title: 'Content Moderation Failed',
            description: moderationResult.reason,
          });
          return;
        }

        // For this example, we'll use a placeholder for the video and thumbnail URLs.
        // In a real app, you would upload the file to a service like Firebase Storage
        // and get the URLs from there.
        const placeholderVideoUrl = 'https://placehold.co/600x400.mp4?text=Video';
        const placeholderThumbnailUrl = 'https://placehold.co/600x400?text=Thumbnail';
        
        const videosCollection = collection(firestore, 'videos');
        await addDocumentNonBlocking(videosCollection, {
          userId: user.uid,
          title: data.title,
          description: data.description,
          videoUrl: placeholderVideoUrl,
          thumbnailUrl: placeholderThumbnailUrl,
          uploadDate: serverTimestamp(),
          category: 'Spiritual',
        });

        toast({
          title: 'Upload Successful!',
          description: 'Your video has been added.',
        });
        router.push('/');
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Something went wrong. Please try again.',
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Upload a Video</CardTitle>
            <CardDescription>Share your spiritual and mythological videos with the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., The Story of Ganesha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short summary of your video" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video File</FormLabel>
                      <FormControl>
                        <Input type="file" accept="video/*" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload and Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
