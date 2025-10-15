
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
  name: z.object({ en: z.string().min(1, "English name is required.") }),
  officialWebsite: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  deity: z.object({ name: z.object({ en: z.string().min(1, "Deity name is required.") }) }),
  location: z.object({
      address: z.string().min(1, "Address is required."),
      city: z.string().min(1, "City is required."),
      state: z.string().min(1, "State is required."),
      pincode: z.string().min(6, "Pincode is required."),
      geo: z.object({
          lat: z.coerce.number(),
          lng: z.coerce.number(),
      }),
  }),
  importance: z.object({
    mythological: z.object({ en: z.string().min(1, "Mythological importance is required.") }),
    historical: z.object({ en: z.string().optional() }),
  }),
  media: z.object({
      images: z.array(z.object({
          url: z.string().url("Must be a valid URL."),
          hint: z.string().min(1, "Hint is required."),
      })).min(1, "At least one image is required."),
  }),
  visitingInfo: z.object({
      timings: z.object({ en: z.string().min(1, "Timings are required.") }),
      festivals: z.object({ en: z.string().optional() }),
      dressCode: z.object({ en: z.string().optional() }),
      poojaGuidelines: z.object({ en: z.string().optional() }),
  }),
  nearbyInfo: z.object({
      placesToVisit: z.object({ en: z.string().optional() }),
      accommodation: z.object({ en: z.string().optional() }),
      food: z.object({ en: z.string().optional() }),
      transport: z.object({ en: z.string().optional() }),
      guides: z.object({ en: z.string().optional() }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TempleFormProps {
  temple?: any;
}

export function TempleForm({ temple }: TempleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: temple || {
      slug: '',
      name: { en: '' },
      deity: { name: { en: '' } },
      location: { city: '', state: '', pincode: '', address: '', geo: { lat: 0, lng: 0 } },
      importance: { mythological: { en: '' }, historical: { en: '' } },
      media: { images: [{ url: '', hint: '' }] },
      visitingInfo: { timings: { en: '' } },
      nearbyInfo: {},
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "media.images",
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        if (temple) {
          console.log("Updating temple (mock):", { id: temple.id, ...data });
          toast({ title: 'Temple Updated! (Mock)', description: 'The temple has been successfully updated.' });
        } else {
          console.log("Creating new temple (mock):", data);
          toast({ title: 'Temple Created! (Mock)', description: 'The new temple has been added.' });
        }
        router.push('/admin/content');
      } catch (error) {
        console.error('Failed to save temple:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save the temple. Please try again.',
        });
      }
    });
  };
  
  const titleText = temple ? `Edit ${temple.name.en}` : 'Add a New Temple';
  const descriptionText = temple ? 'Update the details for this temple.' : 'Fill out the form to add a new temple to the database.';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
        <CardDescription>{descriptionText}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h3 className="text-xl font-semibold text-primary">Basic Information</h3>
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormDescription>Unique identifier for the URL (e.g., 'ram-mandir-ayodhya').</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name.en" render={({ field }) => (
              <FormItem><FormLabel>Name (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="officialWebsite" render={({ field }) => (
              <FormItem><FormLabel>Official Website</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="deity.name.en" render={({ field }) => (
              <FormItem><FormLabel>Primary Deity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Separator />
            <h3 className="text-xl font-semibold text-primary">Location</h3>
            <FormField control={form.control} name="location.address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="location.city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location.state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location.pincode" render={({ field }) => (
                <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="location.geo.lat" render={({ field }) => (
                <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location.geo.lng" render={({ field }) => (
                <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Separator />
            <h3 className="text-xl font-semibold text-primary">Importance & Significance</h3>
            <FormField control={form.control} name="importance.mythological.en" render={({ field }) => (
                <FormItem><FormLabel>Mythological Importance</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="importance.historical.en" render={({ field }) => (
                <FormItem><FormLabel>Historical Importance</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />


            <Separator />
            <h3 className="text-xl font-semibold text-primary">Media</h3>
             <div>
              <h3 className="text-lg font-medium mb-2">Images</h3>
              {imageFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start mb-4 border p-4 rounded-md">
                   <FormField control={form.control} name={`media.images.${index}.url`} render={({ field }) => (
                      <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`media.images.${index}.hint`} render={({ field }) => (
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
            <h3 className="text-xl font-semibold text-primary">Visitor Information</h3>
            <FormField control={form.control} name="visitingInfo.timings.en" render={({ field }) => (
                <FormItem><FormLabel>Timings</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="visitingInfo.festivals.en" render={({ field }) => (
                <FormItem><FormLabel>Festivals</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="visitingInfo.dressCode.en" render={({ field }) => (
                <FormItem><FormLabel>Dress Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="visitingInfo.poojaGuidelines.en" render={({ field }) => (
                <FormItem><FormLabel>Pooja Guidelines</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Separator />
            <h3 className="text-xl font-semibold text-primary">Nearby Information & Suggestions</h3>
             <FormField control={form.control} name="nearbyInfo.accommodation.en" render={({ field }) => (
                <FormItem><FormLabel>Suggested Accommodation</FormLabel><FormControl><Textarea placeholder="List suggested hotels, dharamshalas, etc." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="nearbyInfo.food.en" render={({ field }) => (
                <FormItem><FormLabel>Suggested Food/Restaurants</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="nearbyInfo.transport.en" render={({ field }) => (
                <FormItem><FormLabel>Suggested Transport/Travel Agents</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="nearbyInfo.guides.en" render={({ field }) => (
                <FormItem><FormLabel>Suggested Tourist Guides</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="nearbyInfo.placesToVisit.en" render={({ field }) => (
                <FormItem><FormLabel>Other Places to Visit Nearby</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {temple ? 'Save Changes' : 'Create Temple'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
