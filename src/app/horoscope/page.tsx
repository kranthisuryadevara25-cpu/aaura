
'use client';

import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HoroscopePage() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const { t } = useLanguage();

  const horoscopeRef = user ? doc(db, `users/${user.uid}/horoscopes/daily`) : undefined;
  const [horoscope, horoscopeLoading] = useDocumentData(horoscopeRef);

  const isLoading = authLoading || horoscopeLoading;

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

  if (!horoscope) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
          <Alert>
              <Star className="h-4 w-4"/>
              <AlertTitle>{t.horoscope.noHoroscopeTitle}</AlertTitle>
              <AlertDescription>
                   {t.horoscope.noHoroscopeDescription}
                  <Button asChild className="mt-4">
                      <Link href="/settings">{t.horoscope.setupProfileButton}</Link>
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
              <span>{horoscope.zodiacSign}</span>
              <span className="text-sm font-normal text-muted-foreground">{horoscope.date}</span>
            </CardTitle>
            <CardDescription>{t.horoscope.dailyReading}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground/90 leading-relaxed">{horoscope.text_en || horoscope.text}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
