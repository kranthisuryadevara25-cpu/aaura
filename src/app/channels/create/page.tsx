
'use client';

import { useTransition } from 'react';
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
import { useLanguage } from '@/hooks/use-language';

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
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    if (!user || !firestore) {
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
          description_en: data.description,
          description_hi: data.description,
          description_te: data.description,
          creationDate: serverTimestamp(),
        }, {});

        toast({
          title: t.toasts.channelCreatedTitle,
          description: t.toasts.channelCreatedDescription,
        });
        router.push('/channels');
      } catch (error) {
        console.error('Channel creation failed:', error);
        toast({
          variant: 'destructive',
          title: t.toasts.creationFailedTitle,
          description: t.toasts.creationFailedDescription,
        });
      }
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
            <Navigation />
          </Sidebar>
          <SidebarInset>
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
              <Card className="w-full max-w-2xl bg-card">
                <CardHeader>
                  <CardTitle>{t.createChannel.title}</CardTitle>
                  <CardDescription>{t.createChannel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.createChannel.nameLabel}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.createChannel.namePlaceholder} {...field} />
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
                            <FormLabel>{t.createChannel.descriptionLabel}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={t.createChannel.descriptionPlaceholder} {...field} />
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
                        {t.createChannel.submitButton}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
