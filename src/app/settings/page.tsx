
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/app/components/header';
import { generatePersonalizedHoroscope } from '@/ai/flows/personalized-horoscope';
import { zodiacSigns } from '@/lib/zodiac';
import { useMemo, useTransition } from 'react';

const formSchema = z.object({
  zodiacSign: z.string({ required_error: 'Please select your zodiac sign.' }),
  birthDate: z.date({ required_error: 'Please select your birth date.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const userDocRef = useMemo(() => {
    if (!firestore || !user) return undefined;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);
  
  const { data: userData, isLoading: isUserLoading } = useDoc(userDocRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      zodiacSign: userData?.zodiacSign || '',
      birthDate: userData?.birthDate ? new Date(userData.birthDate) : new Date(),
    },
    resetOptions: {
        keepDirtyValues: true,
    }
  });
  
  const onSubmit = (data: FormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
      return;
    }

    startTransition(async () => {
      try {
        const formattedBirthDate = format(data.birthDate, 'yyyy-MM-dd');
        
        // Update user profile in Firestore
        const userProfileData = {
          zodiacSign: data.zodiacSign,
          birthDate: formattedBirthDate,
        };
        setDocumentNonBlocking(doc(firestore, `users/${user.uid}`), userProfileData, { merge: true });

        // Generate and save horoscope
        const horoscopeResult = await generatePersonalizedHoroscope({
          zodiacSign: data.zodiacSign,
          birthDate: formattedBirthDate,
        });
        
        const horoscopeData = {
          userId: user.uid,
          date: format(new Date(), 'yyyy-MM-dd'),
          zodiacSign: data.zodiacSign,
          text: horoscopeResult.horoscope,
        };
        // We use 'daily' as the ID to ensure there's only one horoscope per user per day which is overwritten
        setDocumentNonBlocking(doc(firestore, `users/${user.uid}/horoscopes/daily`), horoscopeData, { merge: true });

        toast({
          title: 'Settings Saved!',
          description: 'Your horoscope has been generated and is available on the dashboard.',
        });
      } catch (error) {
        console.error('Failed to save settings and generate horoscope:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save your settings or generate your horoscope. Please try again.',
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Personalization Settings</CardTitle>
            <CardDescription>
              Provide your birth details to receive personalized daily horoscopes. This information is kept private.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zodiac Sign</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your zodiac sign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zodiacSigns.map((sign) => (
                            <SelectItem key={sign} value={sign}>
                              {sign}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Birth Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Used to generate your personalized horoscope.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                  ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save and Generate Horoscope
                      </>
                  )}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
