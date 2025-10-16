
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  id: z.string().min(3, "Contest ID is required"),
  title: z.string().min(10, "Title must be at least 10 characters."),
  goal: z.coerce.number().min(1, "Goal must be at least 1."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateContestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      title: '',
      goal: 10000000,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const contestRef = doc(db, 'contests', data.id);
      const contestData = {
        title: data.title,
        goal: data.goal,
        totalChants: 0,
        status: 'active',
        startDate: serverTimestamp(),
        endDate: null, // Or a specific end date
      };
      
      setDoc(contestRef, contestData)
        .then(() => {
          toast({ title: 'Contest Created!', description: `The "${data.title}" contest is now active.` });
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
                <CardTitle>Create a New Contest</CardTitle>
                <CardDescription>Fill out the details below to launch a new global chanting contest.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField control={form.control} name="id" render={({ field }) => (
                        <FormItem><FormLabel>Contest ID</FormLabel><FormControl><Input placeholder="e.g., jai-shri-ram-2025" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Contest Title</FormLabel><FormControl><Input placeholder="E.g., Jai Shri Ram Global Chant Marathon" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>Chant Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
