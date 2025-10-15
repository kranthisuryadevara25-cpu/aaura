
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
import { Loader2 } from 'lucide-react';
import type { EpicHero } from '@/lib/characters';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required."),
  name: z.object({ en: z.string().min(1, "English name is required.") }),
  description: z.string().min(1, "English description is required."),
  imageUrl: z.string().url("Must be a valid URL."),
  imageHint: z.string().optional(),
  epicAssociation: z.string().min(1, "Epic association is required (e.g., Mahabharata)."),
});

type FormValues = z.infer<typeof formSchema>;

interface CharacterFormProps {
  character?: EpicHero;
}

export function CharacterForm({ character }: CharacterFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: character ? {
      slug: character.slug,
      name: { en: character.name.en || '' },
      description: character.description,
      imageUrl: character.imageUrl,
      imageHint: character.imageHint,
      epicAssociation: character.epicAssociation.join(', '),
    } : {
      slug: '',
      name: { en: '' },
      description: '',
      imageUrl: '',
      imageHint: '',
      epicAssociation: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const characterId = character ? character.id : data.slug;
      const characterRef = doc(db, 'epicHeroes', characterId);
      
      const fullData = {
          id: characterId,
          ...data,
          epicAssociation: data.epicAssociation.split(',').map(s => s.trim()),
          // Add other fields with default values
          background: character?.background || { birth: '', earlyLife: '', family: { parents: [], siblings: [], spouses: [], children: [] } },
          prominence: character?.prominence || '',
          qualities: character?.qualities || [],
          achievements: character?.achievements || [],
          mistakes: character?.mistakes || [],
          learningsForChildren: character?.learningsForChildren || [],
          relatedContent: character?.relatedContent || { sacredTales: [], deities: [], rituals: [] },
          popularity: character?.popularity || 0,
          quote: character?.quote || {text: '', source: ''},
          modernRelevance: character?.modernRelevance || '',
          updatedAt: serverTimestamp(),
          ...(character ? {} : { createdAt: serverTimestamp() }),
      }

      setDoc(characterRef, fullData, { merge: true })
      .then(() => {
        toast({ title: `Character ${character ? 'Updated' : 'Created'}!`, description: `The character has been successfully saved.` });
        router.push('/admin/content');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: characterRef.path,
            operation: 'write',
            requestResourceData: fullData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    });
  };
  
  const title = character ? `Edit ${character.name.en}` : 'Add a New Epic Hero';
  const description = character ? 'Update the details for this hero.' : 'Fill out the form to add a new hero to the database.';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormDescription>A unique identifier for the URL (e.g., 'hanuman').</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name.en" render={({ field }) => (
              <FormItem><FormLabel>Name (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Short Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imageHint" render={({ field }) => (
                <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="epicAssociation" render={({ field }) => (
              <FormItem><FormLabel>Epic Association</FormLabel><FormDescription>Comma-separated epics (e.g., Ramayana, Mahabharata).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {character ? 'Save Changes' : 'Create Hero'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
