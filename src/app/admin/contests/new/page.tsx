
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
import { useFirestore } from '@/lib/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  imageUrl: z.string().url("Must be a valid image URL."),
  imageHint: z.string().optional(),
  goal: z.coerce.number().min(1, "Goal must be at least 1."),
  status: z.enum(['active', 'inactive']),
});


type FormValues = z.infer<typeof formSchema>;

export default function NewContestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/1200/800`,
      imageHint: 'chanting people',
      goal: 108000,
      status: 'inactive',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const contestId = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-5);
      const contestRef = doc(db, 'contests', contestId);
      
      const contestData = {
        id: contestId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        goal: data.goal,
        totalChants: 0,
        status: data.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(contestRef, contestData)
        .then(() => {
          toast({ title: 'Contest Created!', description: `The "${data.title}" contest has been created with status: ${data.status}.` });
          router.push('/admin/content?tab=contests');
        })
        .catch((error) => {
          console.error("Error creating contest: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to create contest.' });
        });
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
             <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Content Management
            </Button>
            <Card className="w-full">
            <CardHeader>
                <CardTitle>Create New Contest</CardTitle>
                <CardDescription>Fill out the form to launch a new global chanting contest.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Contest Title</FormLabel><FormControl><Input placeholder="E.g., Jai Shri Ram Global Chant Marathon" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short description of the contest's purpose." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="imageHint" render={({ field }) => (
                            <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>E.g., 'praying hands'</FormDescription><FormMessage /></FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>Chant Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Set contest status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Create Contest
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
    </main>
  );
}
