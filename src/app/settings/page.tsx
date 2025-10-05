
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
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalizedHoroscope } from '@/ai/flows/personalized-horoscope';
import { zodiacSigns } from '@/lib/zodiac';
import { useTransition, useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  birthDate: z.date({ required_error: 'Please select your birth date.' }),
  timeOfBirth: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format.'),
  placeOfBirth: z.string().min(1, 'Place of birth is required.'),
  fatherName: z.string().min(1, "Father's name is required."),
  motherName: z.string().min(1, "Mother's name is required."),
  zodiacSign: z.string({ required_error: 'Please select your zodiac sign.' }),
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


export default function SettingsPage() {
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const [isPending, startTransition] = useTransition();

  const userDocRef = user ? doc(db, `users/${user.uid}`) : undefined;
  const [userData, isUserLoading] = useDocumentData(userDocRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const birthDateValue = form.watch('birthDate');
  const [dateInputValue, setDateInputValue] = useState(
    birthDateValue ? format(birthDateValue, 'yyyy-MM-dd') : ''
  );

  useEffect(() => {
    if (userData) {
      const initialBirthDate = userData.birthDate ? parse(userData.birthDate, 'yyyy-MM-dd', new Date()) : undefined;
      form.reset({
        fullName: userData.fullName || user?.displayName || '',
        birthDate: initialBirthDate,
        timeOfBirth: userData.timeOfBirth || '12:00',
        placeOfBirth: userData.placeOfBirth || '',
        fatherName: userData.fatherName || '',
        motherName: userData.motherName || '',
        zodiacSign: userData.zodiacSign || '',
      });
      if (initialBirthDate) {
        setDateInputValue(format(initialBirthDate, 'yyyy-MM-dd'));
      }
    }
  }, [userData, user, form]);

  useEffect(() => {
    if (birthDateValue) {
        const sign = getZodiacSign(birthDateValue);
        form.setValue('zodiacSign', sign);
    }
  },[birthDateValue, form])

  
  const onSubmit = (data: FormValues) => {
    if (!user || !auth?.currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
      return;
    }

    startTransition(async () => {
      try {
        const formattedBirthDate = format(data.birthDate, 'yyyy-MM-dd');
        
        await updateProfile(auth.currentUser, { displayName: data.fullName });

        const userProfileData = {
          ...data,
          birthDate: formattedBirthDate,
          profileComplete: true,
        };
        await setDoc(doc(db, `users/${user.uid}`), userProfileData, { merge: true });

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
        await setDoc(doc(db, `users/${user.uid}/horoscopes/daily`), horoscopeData, { merge: true });

        toast({
          title: 'Settings Saved!',
          description: 'Your profile has been updated and your horoscope generated.',
        });
      } catch (error) {
        console.error('Failed to save settings:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Could not save your settings. Please try again.',
        });
      }
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
        <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Profile & Personalization</CardTitle>
            <CardDescription>
            Manage your profile details to personalize your experience.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isUserLoading || loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
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
                          <div className="relative w-[240px]">
                          <FormControl>
                            <Input
                              value={dateInputValue}
                              onChange={(e) => setDateInputValue(e.target.value)}
                              onBlur={() => {
                                const parsedDate = parse(dateInputValue, 'yyyy-MM-dd', new Date());
                                if (isValid(parsedDate)) {
                                  field.onChange(parsedDate);
                                }
                              }}
                              placeholder="YYYY-MM-DD"
                            />
                          </FormControl>
                            <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) {
                                setDateInputValue(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            captionLayout="dropdown-buttons"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>You can type your birth date or pick one from the calendar.</FormDescription>
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
                        <Input type="time" {...field} />
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
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zodiac Sign</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormDescription>This is automatically detected from your birth date.</FormDescription>
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
                        Save Profile
                    </>
                )}
                </Button>
            </form>
            </Form>
            )}
        </CardContent>
        </Card>
    </main>
  );
}
