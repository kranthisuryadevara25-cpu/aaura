
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
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser, setDocumentNonBlocking, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/app/components/header';
import { zodiacSigns } from '@/lib/zodiac';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { generatePersonalizedHoroscope } from '@/ai/flows/personalized-horoscope';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  birthDate: z.date({ required_error: 'Please select your birth date.' }),
  timeOfBirth: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format.'),
  placeOfBirth: z.string().min(1, 'Place of birth is required.'),
  fatherName: z.string().min(1, "Father's name is required."),
  motherName: z.string().min(1, "Mother's name is required."),
  zodiacSign: z.string(), // Not required, will be auto-detected
});

type FormValues = z.infer<typeof formSchema>;

const getZodiacSign = (date: Date): (typeof zodiacSigns)[number] => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

export default function ProfileSetupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      placeOfBirth: '',
      timeOfBirth: '',
      fatherName: '',
      motherName: '',
    },
  });
  
  const onSubmit = (data: FormValues) => {
    if (!user || !firestore || !auth?.currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to complete your profile.' });
      return;
    }

    startTransition(async () => {
      try {
        const formattedBirthDate = format(data.birthDate, 'yyyy-MM-dd');
        const zodiacSign = getZodiacSign(data.birthDate);
        
        await updateProfile(auth.currentUser, { displayName: data.fullName });
        
        const userProfileData = {
          fullName: data.fullName,
          birthDate: formattedBirthDate,
          timeOfBirth: data.timeOfBirth,
          placeOfBirth: data.placeOfBirth,
          fatherName: data.fatherName,
          motherName: data.motherName,
          zodiacSign,
          profileComplete: true,
          email: user.email,
        };
        
        setDocumentNonBlocking(doc(firestore, `users/${user.uid}`), userProfileData, { merge: true });

        const horoscopeResult = await generatePersonalizedHoroscope({
          zodiacSign: zodiacSign,
          birthDate: formattedBirthDate,
        });
        
        const horoscopeData = {
          userId: user.uid,
          date: format(new Date(), 'yyyy-MM-dd'),
          zodiacSign: zodiacSign,
          text: horoscopeResult.horoscope,
        };
        setDocumentNonBlocking(doc(firestore, `users/${user.uid}/horoscopes/daily`), horoscopeData, { merge: true });

        toast({
          title: 'Profile Complete!',
          description: 'Welcome to aaura! Your spiritual journey begins now.',
        });
        
        router.push('/');

      } catch (error) {
        console.error('Failed to save profile:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save your profile. Please try again.',
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
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
              A few more details will help us personalize your spiritual journey.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
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
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                captionLayout="dropdown-buttons"
                              />
                            </PopoverContent>
                          </Popover>
                           <FormDescription>You can also type your birth date in YYYY-MM-DD format.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time of Birth</FormLabel>
                          <FormControl>
                            <Input type="time" placeholder="HH:MM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="placeOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Place of Birth</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Father's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Mother's full name" {...field} />
                          </FormControl>
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
                          Save and Continue
                      </>
                  )}
                  </Button>
              </form>
              </Form>
          </CardContent>
          </Card>
      </main>
    </div>
  );
}

    