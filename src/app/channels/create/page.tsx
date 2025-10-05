
'use client';

import { useState, useTransition } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { Header } from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Channel name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateChannelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a channel.' });
      return;
    }

    startTransition(async () => {
      try {
        const channelId = user.uid; // Use user's UID as channel ID for a 1-to-1 mapping
        const channelRef = doc(firestore, 'channels', channelId);

        await setDocumentNonBlocking(channelRef, {
          userId: user.uid,
          name: data.name,
          description: data.description,
          creationDate: serverTimestamp(),
        }, {});

        toast({
          title: 'Channel Created!',
          description: 'Your new channel has been successfully created.',
        });
        router.push('/channels');
      } catch (error) {
        console.error('Channel creation failed:', error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: 'Something went wrong while creating your channel. Please try again.',
        });
      }
    });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <Navigation />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Create Your Channel</CardTitle>
                <CardDescription>Start sharing your spiritual content with the aaura community.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Ancient Wisdom Today" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A short summary of what your channel is about" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                      )}
                      Create Channel
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
