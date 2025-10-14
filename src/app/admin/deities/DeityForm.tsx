
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

const formSchema = z.object({
  slug: z.string().min(1, "Slug is required."),
  name: z.object({
    en: z.string().min(1, "English name is required."),
    hi: z.string().optional(),
    te: z.string().optional(),
    mr: z.string().optional(),
    ta: z.string().optional(),
    kn: z.string().optional(),
    bn: z.string().optional(),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required."),
    hi: z.string().optional(),
    te: z.string().optional(),
    mr: z.string().optional(),
    ta: z.string().optional(),
    kn: z.string().optional(),
    bn: z.string().optional(),
  }),
  images: z.array(z.object({
    url: z.string().url("Must be a valid URL."),
    hint: z.string().min(1, "Hint is required."),
  })).min(1, "At least one image is required."),
  mantras: z.array(z.object({
    sanskrit: z.string().min(1, "Sanskrit text is required."),
    translation_en: z.string().min(1, "English translation is required."),
  })).optional(),
   stotras: z.array(z.object({
    title: z.object({ en: z.string().min(1, "English title is required.") }),
    sanskrit: z.string().min(1, "Sanskrit text is required."),
    translation_en: z.string().min(1, "English translation is required."),
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DeityFormProps {
  deity?: any;
}

export function DeityForm({ deity }: DeityFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: deity || {
      slug: '',
      name: { en: '' },
      description: { en: '' },
      images: [{ url: '', hint: '' }],
      mantras: [{sanskrit: '', translation_en: ''}],
      stotras: [{title: {en: ''}, sanskrit: '', translation_en: ''}],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });
  
  const { fields: mantraFields, append: appendMantra, remove: removeMantra } = useFieldArray({
    control: form.control,
    name: "mantras",
  });

  const { fields: stotraFields, append: appendStotra, remove: removeStotra } = useFieldArray({
    control: form.control,
    name: "stotras",
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        if (deity) {
          // Mock update
          console.log("Updating deity (mock):", { id: deity.id, ...data });
          toast({ title: 'Deity Updated! (Mock)', description: 'The deity has been successfully updated.' });
        } else {
          // Mock create
          console.log("Creating new deity (mock):", data);
          toast({ title: 'Deity Created! (Mock)', description: 'The new deity has been added.' });
        }
        router.push('/admin/content');
      } catch (error) {
        console.error('Failed to save deity:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save the deity. Please try again.',
        });
      }
    });
  };
  
  const title = deity ? `Edit ${deity.name.en}` : 'Add a New Deity';
  const description = deity ? 'Update the details for this deity.' : 'Fill out the form to add a new deity to the database.';

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
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormDescription>A unique identifier for the URL (e.g., 'sri-ganesha').</FormDescription>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="name.en" render={({ field }) => (
              <FormItem><FormLabel>Name (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="description.en" render={({ field }) => (
              <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Separator />
            
            {/* Images */}
            <div>
              <h3 className="text-lg font-medium mb-2">Images</h3>
              {imageFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start mb-4 border p-4 rounded-md">
                   <FormField control={form.control} name={`images.${index}.url`} render={({ field }) => (
                      <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`images.${index}.hint`} render={({ field }) => (
                      <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)} className="mt-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ url: '', hint: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </div>

            <Separator />
            
            {/* Mantras */}
            <div>
                <h3 className="text-lg font-medium mb-2">Mantras</h3>
                 {mantraFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 mb-4 border p-4 rounded-md relative">
                         <Button type="button" variant="destructive" size="icon" onClick={() => removeMantra(index)} className="absolute top-2 right-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormField control={form.control} name={`mantras.${index}.sanskrit`} render={({ field }) => (
                            <FormItem><FormLabel>Sanskrit</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`mantras.${index}.translation_en`} render={({ field }) => (
                            <FormItem><FormLabel>English Translation</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendMantra({ sanskrit: '', translation_en: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Mantra
                </Button>
            </div>
            
            <Separator />

             {/* Stotras */}
            <div>
                <h3 className="text-lg font-medium mb-2">Stotras</h3>
                 {stotraFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 mb-4 border p-4 rounded-md relative">
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeStotra(index)} className="absolute top-2 right-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                         <FormField control={form.control} name={`stotras.${index}.title.en`} render={({ field }) => (
                            <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`stotras.${index}.sanskrit`} render={({ field }) => (
                            <FormItem><FormLabel>Sanskrit</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`stotras.${index}.translation_en`} render={({ field }) => (
                            <FormItem><FormLabel>English Translation</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendStotra({ title: { en: '' }, sanskrit: '', translation_en: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Stotra
                </Button>
            </div>


            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {deity ? 'Save Changes' : 'Create Deity'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
