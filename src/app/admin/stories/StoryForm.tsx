
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required."),
  title: z.object({ en: z.string().min(1, "English title is required.") }),
  summary: z.object({ en: z.string().min(1, "English summary is required.") }),
  image: z.object({
    url: z.string().url("Must be a valid URL."),
    hint: z.string().min(1, "Hint is required."),
  }),
  tags: z.string().min(1, "At least one tag is required."),
  relatedCharacters: z.string().optional(),
  relatedTemples: z.string().optional(),
  episodes: z.array(z.object({
    episodeNumber: z.coerce.number().min(1, "Episode number is required."),
    title: z.object({ en: z.string().min(1, "English title is required.") }),
    description: z.object({ en: z.string().min(1, "English description is required.") }),
    videoId: z.string().min(1, "YouTube Video ID is required."),
    thumbnailUrl: z.string().url("Must be a valid URL."),
    duration: z.coerce.number().min(1, "Duration in seconds is required."),
  })).min(1, "At least one episode is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface StoryFormProps {
  story?: any;
}

export function StoryForm({ story }: StoryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: story ? {
        ...story,
        tags: story.tags?.join(', '),
        relatedCharacters: story.relatedCharacters?.join(', '),
        relatedTemples: story.relatedTemples?.join(', '),
    } : {
      slug: '',
      title: { en: '' },
      summary: { en: '' },
      image: { url: '', hint: '' },
      tags: '',
      relatedCharacters: '',
      relatedTemples: '',
      episodes: [{ episodeNumber: 1, title: {en: ''}, description: {en: ''}, videoId: '', thumbnailUrl: '', duration: 0 }],
    },
  });
  
  const { fields: episodeFields, append: appendEpisode, remove: removeEpisode } = useFieldArray({
    control: form.control,
    name: "episodes",
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const storyId = story ? story.id : data.slug;
      const storyRef = doc(db, 'stories', storyId);

      const fullData = {
          id: storyId,
          ...data,
          tags: data.tags.split(',').map(s => s.trim()),
          relatedCharacters: data.relatedCharacters ? data.relatedCharacters.split(',').map(s => s.trim()) : [],
          relatedTemples: data.relatedTemples ? data.relatedTemples.split(',').map(s => s.trim()) : [],
          status: 'published',
          updatedAt: serverTimestamp(),
          ...(story.status === 'unclaimed' && { createdAt: serverTimestamp() }),
      };

      setDoc(storyRef, fullData, { merge: true })
      .then(() => {
        toast({ title: `Story ${story ? 'Updated' : 'Created'}!`, description: 'The story has been successfully saved.' });
        router.push('/admin/content');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: storyRef.path,
            operation: 'write',
            requestResourceData: fullData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    });
  };
  
  const title = story ? `Edit ${story.title?.en || story.name.en}` : 'Add a New Story';
  const description = story ? 'Update the details for this story.' : 'Fill out the form to add a new story to the database.';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormDescription>A unique identifier for the URL (e.g., 'ramayana-summary').</FormDescription><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="title.en" render={({ field }) => (
              <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="summary.en" render={({ field }) => (
              <FormItem><FormLabel>Summary (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="image.url" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="image.hint" render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem><FormLabel>Tags</FormLabel><FormDescription>Comma-separated tags (e.g., Epic, Dharma, Rama).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="relatedCharacters" render={({ field }) => (
                <FormItem><FormLabel>Related Characters</FormLabel><FormDescription>Comma-separated character slugs (e.g., rama, sita, hanuman).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="relatedTemples" render={({ field }) => (
                <FormItem><FormLabel>Related Temples</FormLabel><FormDescription>Comma-separated temple slugs (e.g., ram-mandir-ayodhya).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormMessage>
            )} />


            <Separator />
            
            {/* Episodes */}
            <div>
              <h3 className="text-lg font-medium mb-2">Episodes</h3>
              {episodeFields.map((field, index) => (
                <div key={field.id} className="space-y-4 mb-4 border p-4 rounded-md relative">
                   <Button type="button" variant="destructive" size="icon" onClick={() => removeEpisode(index)} className="absolute top-2 right-2">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField control={form.control} name={`episodes.${index}.episodeNumber`} render={({ field }) => (
                        <FormItem><FormLabel>Episode Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`episodes.${index}.title.en`} render={({ field }) => (
                        <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name={`episodes.${index}.description.en`} render={({ field }) => (
                        <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`episodes.${index}.videoId`} render={({ field }) => (
                            <FormItem><FormLabel>YouTube Video ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`episodes.${index}.thumbnailUrl`} render={({ field }) => (
                            <FormItem><FormLabel>Thumbnail URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`episodes.${index}.duration`} render={({ field }) => (
                            <FormItem><FormLabel>Duration (seconds)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendEpisode({ episodeNumber: episodeFields.length + 1, title: {en: ''}, description: {en: ''}, videoId: '', thumbnailUrl: '', duration: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Episode
              </Button>
            </div>


            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {story ? 'Save Changes' : 'Create Story'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
