
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth, useFirestore, useStorage } from '@/lib/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ImageUpload';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  templeName: z.string().min(5, "Temple name is required."),
  location: z.string().min(5, "Location is required."),
  description: z.string().min(50, "Please provide a detailed description (min 50 characters)."),
  totalGoal: z.coerce.number().min(1000, "Fund goal must be at least ₹1000."),
  progressStatus: z.enum(['planning', 'in-progress', 'completed']),
  proposedStartDate: z.date().optional(),
  proposedCompletionDate: z.date().optional(),
  hasSocietyRegistration: z.boolean().default(false),
  hasApprovals: z.boolean().default(false),
  imageFile: z.any().optional(),
  videoFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequestRenovationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templeName: '',
      location: '',
      description: '',
      totalGoal: 50000,
      progressStatus: 'planning',
      hasSocietyRegistration: false,
      hasApprovals: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const user = auth.currentUser;
      if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to submit a request.' });
        return;
      }

      try {
        toast({ title: "Submitting request...", description: "Please wait while we process your submission." });
        
        const imageFile = data.imageFile?.[0];
        const videoFile = data.videoFile?.[0];

        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadMedia(imageFile, "renovation_requests");
        }
        
        const videoUrl = videoFile ? await uploadMedia(videoFile, "renovation_requests") : null;
        
        const requestData = {
          ...data,
          proposedStartDate: data.proposedStartDate ? format(data.proposedStartDate, "yyyy-MM-dd") : null,
          proposedCompletionDate: data.proposedCompletionDate ? format(data.proposedCompletionDate, "yyyy-MM-dd") : null,
          imageFile: undefined, // remove file objects
          videoFile: undefined,
          imageUrl,
          videoUrl,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          status: 'pending',
        };

        await addDoc(collection(db, 'temple_renovation_requests'), requestData);

        toast({ title: 'Request Submitted!', description: 'Your request for temple renovation funding has been submitted for review.' });
        router.push('/temples/seva');

      } catch (error) {
        console.error("Error submitting request:", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your request.' });
      }
    });
  };
  
  async function uploadMedia(file: File, folder: string) {
      if (!file) return null;
      const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Temple Seva
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Request Temple Renovation Funding</CardTitle>
            <CardDescription>Provide details about the temple and the proposed renovation to seek community support.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <FormField control={form.control} name="templeName" render={({ field }) => (
                  <FormItem><FormLabel>Temple Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location (City, State)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description of Renovation</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormDescription>Describe the current state and the work that needs to be done.</FormDescription><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="totalGoal" render={({ field }) => (
                  <FormItem><FormLabel>Total Funding Goal (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>The total amount required for the renovation project.</FormDescription><FormMessage /></FormItem>
                )} />
                
                 <FormField control={form.control} name="progressStatus" render={({ field }) => (
                    <FormItem><FormLabel>Current Project Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="proposedStartDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Proposed Start Date</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent></Popover>
                        <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="proposedCompletionDate" render={({ field }) => (
                         <FormItem className="flex flex-col"><FormLabel>Proposed Completion Date</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent></Popover>
                        <FormMessage /></FormItem>
                    )} />
                </div>

                 <div className="space-y-4">
                    <FormField control={form.control} name="hasSocietyRegistration" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Is there a registered society/trust for the temple?</FormLabel>
                        </div>
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="hasApprovals" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Are all necessary government approvals in place?</FormLabel>
                        </div>
                        </FormItem>
                    )} />
                 </div>

                <FormField control={form.control} name="imageFile" render={({ field }) => (
                    <FormItem><FormLabel>Temple Image (Optional)</FormLabel><FormControl><Input type="file" accept="image/*" {...form.register("imageFile")} /></FormControl><FormMessage /></FormItem>
                )} />

                 <FormField control={form.control} name="videoFile" render={({ field }) => (
                    <FormItem><FormLabel>Video (Optional)</FormLabel><FormControl><Input type="file" accept="video/*" {...form.register("videoFile")} /></FormControl><FormDescription>A short video showing the temple's condition.</FormDescription><FormMessage /></FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
