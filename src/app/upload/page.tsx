
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
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { moderateContent } from '@/ai/ai-content-moderation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  media: z.instanceof(FileList).refine((files) => files?.length === 1, 'A media file is required.'),
  mediaType: z.enum(['video', 'short', 'bhajan', 'podcast', 'pravachan', 'audiobook']),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mediaType: 'video',
    }
  });

  const fileRef = form.register('media');

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
        const mediaFile = data.media[0];
        const mediaDataUri = await toBase64(mediaFile);
        
        const moderationResult = await moderateContent({
          videoDataUri: mediaDataUri, 
          title: data.title,
          description: data.description,
        });

        if (!moderationResult.isAppropriate) {
          toast({
            variant: 'destructive',
            title: 'Content Moderation Failed',
            description: moderationResult.reason,
            duration: 9000,
          });
          return;
        }

        const placeholderMediaUrl = 'https://placehold.co/600x400.mp4?text=Media+Processing';
        const placeholderThumbnailUrl = 'https://picsum.photos/seed/spirit/600/400';
        
        const mediaCollection = collection(db, 'media');
        await addDoc(mediaCollection, {
          userId: user.uid,
          title: data.title,
          description: data.description,
          mediaUrl: placeholderMediaUrl,
          thumbnailUrl: placeholderThumbnailUrl,
          uploadDate: serverTimestamp(),
          mediaType: data.mediaType,
          duration: 0,
          language: 'English',
          tags: [data.mediaType],
          likes: 0,
          views: 0,
        });

        toast({
          title: 'Upload Successful!',
          description: 'Your media has been submitted and is being processed.',
        });
        router.push('/media');
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
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
        <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Share your spiritual, religious, and wellness content with the community. All content must be positive and uplifting.</CardDescription>
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
                          <Input placeholder="E.g., Morning Yoga for Positive Energy" {...field} />
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
                          <Textarea placeholder="A short summary of your media's positive message" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a media type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="bhajan">Bhajan</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="pravachan">Pravachan</SelectItem>
                          <SelectItem value="audiobook">Audiobook</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Media File</FormLabel>
                    <FormControl>
                        <Input type="file" accept="video/*,audio/*" {...fileRef} />
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
                Moderate and Upload
                </Button>
            </form>
            </Form>
        </CardContent>
        </Card>
    </main>
  );
}
