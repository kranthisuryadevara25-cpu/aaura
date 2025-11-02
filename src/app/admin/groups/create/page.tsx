
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deities } from '@/lib/deities';
import { temples } from '@/lib/temples';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

const formSchema = z.object({
  name: z.string().min(5, "Group name must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  coverImageUrl: z.string().url("Please enter a valid image URL."),
  topicType: z.enum(['deity', 'temple', 'general']),
  topicId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateGroupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      coverImageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
      topicType: 'general',
      topicId: '',
    },
  });

  const topicType = form.watch('topicType');

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const groupsCollection = collection(db, 'groups');
      const newDocRef = doc(groupsCollection);
      const groupData = {
          id: newDocRef.id,
          ...data,
          topicId: data.topicId || '', // Ensure topicId is not undefined
          memberCount: 0,
          createdAt: serverTimestamp(),
      }
      setDoc(newDocRef, groupData)
      .then(() => {
        toast({ 
            title: 'Group Created!', 
            description: 'The new community group has been successfully created.' 
        });
        router.push('/forum');
      })
      .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
                path: groupsCollection.path,
                operation: 'create',
                requestResourceData: groupData
            });
            errorEmitter.emit('permission-error', permissionError);
      })
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
             <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
            </Button>
            <Card className="w-full">
            <CardHeader>
                <CardTitle>Create a New Community Group</CardTitle>
                <CardDescription>Fill out the details below to establish a new group for users to join.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Group Name</FormLabel><FormControl><Input placeholder="E.g., Followers of Lord Shiva" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description of what this group is about." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>You can use a URL from a site like Pexels or Unsplash.</FormDescription><FormMessage /></FormItem>
                    )} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="topicType" render={({ field }) => (
                        <FormItem><FormLabel>Topic Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a topic type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="deity">Deity</SelectItem>
                                <SelectItem value="temple">Temple</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage /></FormItem>
                        )} />

                        {topicType !== 'general' && (
                            <FormField control={form.control} name="topicId" render={({ field }) => (
                                <FormItem><FormLabel>Select {topicType === 'deity' ? 'Deity' : 'Temple'}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={`Select a ${topicType}`} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {(topicType === 'deity' ? deities : temples).map(item => (
                                            <SelectItem key={item.slug} value={item.slug}>{item.name.en}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )} />
                        )}
                    </div>
                    
                    <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Create Group
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
    </main>
  );
}
