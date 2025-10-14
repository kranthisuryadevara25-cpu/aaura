
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  category: z.enum(["Deities", "Stories", "Rituals", "Festivals", "Peace", "Devotion"]),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Deities',
      isPublic: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a playlist.' });
      return;
    }

    startTransition(async () => {
      try {
        const playlistCollection = collection(db, 'playlists');
        await addDoc(playlistCollection, {
          ...data,
          creatorId: user.uid,
          items: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          likesCount: 0,
          viewCount: 0,
        });

        toast({
          title: 'Playlist Created!',
          description: 'Your new playlist has been successfully created.',
        });
        router.push('/playlists');
      } catch (error) {
        console.error('Playlist creation failed:', error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: 'Something went wrong while creating your playlist.',
        });
      }
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Playlist</CardTitle>
          <CardDescription>
            Organize your favorite spiritual content into personalized collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Playlist Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Morning Devotion" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of this playlist's theme or purpose." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Deities">Deities</SelectItem>
                          <SelectItem value="Stories">Stories</SelectItem>
                          <SelectItem value="Rituals">Rituals</SelectItem>
                          <SelectItem value="Festivals">Festivals</SelectItem>
                          <SelectItem value="Peace">Peace</SelectItem>
                          <SelectItem value="Devotion">Devotion</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormDescription>
                      Choosing a category helps others discover your playlist.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Make Playlist Public</FormLabel>
                      <FormDescription>
                        Allow other users to discover and follow your playlist.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Playlist
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

    