
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
import { useTransition, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  goal: z.coerce.number().min(1, "Goal must be at least 1."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

const getContestStatus = (startDate: Date, endDate: Date): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
}

export default function EditContestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const id = params.id as string;
  const contestRef = doc(db, 'contests', id);
  const [contest, loadingContest] = useDocumentData(contestRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (contest) {
      form.reset({
        title: contest.title,
        goal: contest.goal,
        startDate: contest.startDate?.toDate(),
        endDate: contest.endDate?.toDate(),
      });
    }
  }, [contest, form]);


  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const status = getContestStatus(data.startDate, data.endDate);
      const contestData = {
        title: data.title,
        goal: data.goal,
        startDate: data.startDate,
        endDate: data.endDate,
        status: status,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(contestRef, contestData)
        .then(() => {
          toast({ title: 'Contest Updated!', description: `The "${data.title}" contest has been updated with status: ${status}.` });
          router.push('/admin/content?tab=contests');
        })
        .catch((error) => {
          console.error("Error updating contest: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update contest.' });
        });
    });
  };

  if (loadingContest) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
  }
  
  if (!contest) {
      notFound();
  }


  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
             <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Content Management
            </Button>
            <Card className="w-full">
            <CardHeader>
                <CardTitle>Edit Contest</CardTitle>
                <CardDescription>Update the details for the &quot;{contest.title}&quot; contest.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Contest Title</FormLabel><FormControl><Input placeholder="E.g., Jai Shri Ram Global Chant Marathon" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>Chant Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="startDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="endDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </div>
                    
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
    </main>
  );
}
