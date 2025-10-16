
'use client';

import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Loader2, Star, Sparkles, Heart, Briefcase, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HoroscopePage() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const { t, language } = useLanguage();

  const horoscopeRef = user ? doc(db, `users/${user.uid}/horoscopes/daily`) : undefined;
  const [horoscope, horoscopeLoading] = useDocumentData(horoscopeRef);

  const isLoading = authLoading || horoscopeLoading;
  
  const horoscopeText = horoscope?.[`text_${language}`] || horoscope?.text_en;
  
  // A simple function to parse the structured text
  const parseHoroscope = (text: string) => {
    const lines = text?.split('\n');
    const love = lines?.find(l => l.startsWith('Love:'))?.replace('Love:', '').trim();
    const career = lines?.find(l => l.startsWith('Career:'))?.replace('Career:', '').trim();
    const health = lines?.find(l => l.startsWith('Health:'))?.replace('Health:', '').trim();
    return { love, career, health, raw: text };
  }

  const parsedHoroscope = parseHoroscope(horoscopeText);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
          <Alert>
              <Star className="h-4 w-4"/>
              <AlertTitle>{t.horoscope.loginTitle}</AlertTitle>
              <AlertDescription>
                  {t.horoscope.loginDescription}
                  <Button asChild className="mt-4">
                      <Link href="/login">{t.horoscope.loginButton}</Link>
                  </Button>
              </AlertDescription>
          </Alert>
      </main>
    );
  }

  if (!horoscope || !horoscopeText) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
          <Alert>
              <Star className="h-4 w-4"/>
              <AlertTitle>{t.horoscope.noHoroscopeTitle}</AlertTitle>
              <AlertDescription>
                   {t.horoscope.noHoroscopeDescription}
                  <Button asChild className="mt-4">
                      <Link href="/profile/setup">{t.horoscope.setupProfileButton}</Link>
                  </Button>
              </AlertDescription>
          </Alert>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
            <Star className="h-10 w-10" /> {t.horoscope.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.horoscope.description}
          </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" />{horoscope.zodiacSign}</span>
              <span className="text-sm font-normal text-muted-foreground">{new Date(horoscope.date).toLocaleDateString()}</span>
            </CardTitle>
            <CardDescription>{t.horoscope.dailyReading}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {parsedHoroscope.love && (
                <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-red-400 mt-1" />
                    <div>
                        <h3 className="font-semibold text-red-500">Love</h3>
                        <p className="text-foreground/90">{parsedHoroscope.love}</p>
                    </div>
                </div>
             )}
             {parsedHoroscope.career && (
                <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                        <h3 className="font-semibold text-blue-500">Career</h3>
                        <p className="text-foreground/90">{parsedHoroscope.career}</p>
                    </div>
                </div>
             )}
              {parsedHoroscope.health && (
                <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-green-400 mt-1" />
                    <div>
                        <h3 className="font-semibold text-green-500">Health</h3>
                        <p className="text-foreground/90">{parsedHoroscope.health}</p>
                    </div>
                </div>
              )}
               {!parsedHoroscope.love && (
                 <p className="text-lg text-foreground/90 leading-relaxed">{parsedHoroscope.raw}</p>
               )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
