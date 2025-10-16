
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
import { Loader2, PlusCircle, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

export default function NewContestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      goal: 100000,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const contestId = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-5);
      const contestRef = doc(db, 'contests', contestId);
      
      const status = getContestStatus(data.startDate, data.endDate);

      const contestData = {
        id: contestId,
        title: data.title,
        goal: data.goal,
        totalChants: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        status: status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(contestRef, contestData)
        .then(() => {
          toast({ title: 'Contest Created!', description: `The "${data.title}" contest has been created with status: ${status}.` });
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
