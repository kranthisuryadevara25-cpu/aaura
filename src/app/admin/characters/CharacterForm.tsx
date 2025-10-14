
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

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required."),
  name: z.object({ en: z.string().min(1, "English name is required.") }),
  description: z.object({ en: z.string().min(1, "English description is required.") }),
  role: z.object({ en: z.string().min(1, "English role is required.") }),
  image: z.object({
    url: z.string().url("Must be a valid URL."),
    hint: z.string().min(1, "Hint is required."),
  }),
  associatedStories: z.string().optional(),
  attributes: z.string().min(1, "At least one attribute is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface CharacterFormProps {
  character?: any;
}

export function CharacterForm({ character }: CharacterFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: character ? {
      ...character,
      associatedStories: character.associatedStories?.join(', '),
      attributes: character.attributes?.join(', '),
    } : {
      slug: '',
      name: { en: '' },
      description: { en: '' },
      role: { en: ''},
      image: { url: '', hint: '' },
      associatedStories: '',
      attributes: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        if (character) {
          console.log("Updating character (mock):", { id: character.id, ...data });
          toast({ title: 'Character Updated! (Mock)', description: 'The character has been successfully updated.' });
        } else {
          console.log("Creating new character (mock):", data);
          toast({ title: 'Character Created! (Mock)', description: 'The new character has been added.' });
        }
        router.push('/admin/content');
      } catch (error) {
        console.error('Failed to save character:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save the character. Please try again.',
        });
      }
    });
  };
  
  const title = character ? `Edit ${character.name.en}` : 'Add a New Character';
  const description = character ? 'Update the details for this character.' : 'Fill out the form to add a new character to the database.';

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
            <FormField control={form.control} name="description.en" render={({ field }) => (
              <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="role.en" render={({ field }) => (
              <FormItem><FormLabel>Role (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="image.url" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="image.hint" render={({ field }) => (
                <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="attributes" render={({ field }) => (
              <FormItem><FormLabel>Attributes</FormLabel><FormDescription>Comma-separated attributes (e.g., Strength, Devotion, Courage).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="associatedStories" render={({ field }) => (
              <FormItem><FormLabel>Associated Stories</FormLabel><FormDescription>Comma-separated story slugs (e.g., ramayana-summary).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {character ? 'Save Changes' : 'Create Character'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
