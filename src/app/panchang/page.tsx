
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Sunrise, Sunset, Moon, Star, AlertTriangle, PartyPopper, Loader2, BookHeart, Sparkles, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { getPanchangForDate, type Panchang } from '@/lib/panchang';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { personalizePanchang, type PersonalizedPanchangOutput } from '@/ai/flows/personalize-panchang';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';


export default function PanchangPage() {
    const { t, language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [panchang, setPanchang] = useState<Panchang | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aiContent, setAiContent] = useState<PersonalizedPanchangOutput | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const auth = useAuth();
    const db = useFirestore();
    const [user] = useAuthState(auth);
    const userDocRef = user ? doc(db, 'users', user.uid) : undefined;
    const [userData] = useDocumentData(userDocRef);

    useEffect(() => {
        setIsLoading(true);
        const data = getPanchangForDate(selectedDate);
        setPanchang(data);
        setIsLoading(false);

        if (user && userData) {
          setIsAiLoading(true);
          personalizePanchang({
            userId: user.uid,
            zodiacSign: userData.zodiacSign,
            panchang: {
              tithi: data.tithi.en,
              nakshatra: data.nakshatra.en
            }
          }).then(result => {
            setAiContent(result);
          }).finally(() => {
            setIsAiLoading(false);
          });
        }

    }, [selectedDate, user, userData]);

    if (isLoading) {
      return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      )
    }

    if (!panchang) {
       return (
          <main className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">
            <h1 className="text-2xl font-semibold">Panchang data for the selected date is not available.</h1>
          </main>
       )
    }

    const panchangItems = [
        { icon: Star, label: "Tithi", value: panchang.tithi[language] || panchang.tithi.en },
        { icon: Star, label: "Nakshatra", value: panchang.nakshatra[language] || panchang.nakshatra.en },
        { icon: Star, label: "Yoga", value: panchang.yoga[language] || panchang.yoga.en },
        { icon: Star, label: "Karana", value: panchang.karana[language] || panchang.karana.en },
    ];
    
    const timings = [
        { icon: Sunrise, label: "Sunrise", value: panchang.sunrise },
        { icon: Sunset, label: "Sunset", value: panchang.sunset },
        { icon: Moon, label: "Moonrise", value: panchang.moonrise },
        { icon: Moon, label: "Moonset", value: panchang.moonset },
    ];

    const inauspiciousTimings = [
        { icon: AlertTriangle, label: "Rahu Kalam", value: panchang.rahukalam, color: "text-red-500" },
        { icon: AlertTriangle, label: "Yama Gandam", value: panchang.yamaGandam, color: "text-orange-500" },
    ];
    
    const zodiacInsight = panchang.zodiacInsights[userData?.zodiacSign?.toLowerCase() || 'aries'];

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <CalendarDays className="h-10 w-10" /> {t.panchang.title}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {panchang.date}
            </p>
        </div>
        
        <div className="flex justify-center mb-8">
             <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>{format(selectedDate, "PPP")}</span>
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => day && setSelectedDate(day)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>
        
        <div className="max-w-6xl mx-auto space-y-8">
            {panchang.festivals && panchang.festivals.length > 0 && (
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <PartyPopper className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-primary">{t.panchang.todaysFestivals}</CardTitle>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {panchang.festivals.map((festival) => (
                                        <Link key={festival.id} href={`/festivals/${festival.id}`} passHref>
                                            <Badge variant="default" className="cursor-pointer hover:bg-primary/80">{festival.name}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {isAiLoading ? (
                <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
            ) : aiContent && (
                 <Card className="bg-gradient-to-tr from-accent/10 to-background border-accent/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-accent"><BrainCircuit /> Personalized Guidance for you</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {aiContent.recommendations.map((rec, index) => <p key={index} className="text-foreground/90">- {rec}</p>)}
                    </CardContent>
                </Card>
            )}

            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
                <AccordionItem value="item-1" className="border-primary/20 border rounded-lg px-4 bg-transparent">
                     <AccordionTrigger className="text-lg font-semibold hover:no-underline">Core Panchang Details</AccordionTrigger>
                     <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                            {panchangItems.map((item, index) => (
                                <Card key={index} className="bg-transparent border-none shadow-none text-center">
                                    <CardHeader>
                                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-md text-foreground">{item.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-semibold text-muted-foreground">{item.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                     </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2" className="border-primary/20 border rounded-lg px-4 bg-transparent">
                     <AccordionTrigger className="text-lg font-semibold hover:no-underline">Timings</AccordionTrigger>
                     <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <Card className="bg-transparent border-none shadow-none">
                                <CardHeader><CardTitle>{t.panchang.astronomicalTimings}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {timings.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-foreground/90">
                                            <div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-accent" /><span>{item.label}</span></div>
                                            <span className="font-mono font-semibold">{item.value}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="bg-transparent border-none shadow-none">
                                <CardHeader><CardTitle>{t.panchang.inauspiciousTimings}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {inauspiciousTimings.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center gap-3"><item.icon className={`h-5 w-5 ${item.color}`} /> <span className="text-foreground/90">{item.label}</span></div>
                                            <span className="font-mono font-semibold">{item.value}</span>
                                        </div>
))}
                                </CardContent>
                            </Card>
                        </div>
                     </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3" className="border-primary/20 border rounded-lg px-4 bg-transparent">
                     <AccordionTrigger className="text-lg font-semibold hover:no-underline">Today's Guidance</AccordionTrigger>
                     <AccordionContent className="pt-4 space-y-6">
                        {zodiacInsight && (
                            <div>
                                <h3 className="font-semibold text-md mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> For {userData.zodiacSign}</h3>
                                <p className="text-muted-foreground text-sm">{zodiacInsight}</p>
                            </div>
                        )}
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-md mb-2">Auspicious Activities</h3>
                             <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {panchang.auspiciousActivities.map((act, i) => <li key={i}>{act}</li>)}
                             </ul>
                        </div>
                         <Separator />
                          <div>
                            <h3 className="font-semibold text-md mb-2">Wellness Tip</h3>
                             <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {panchang.wellnessTips.map((tip, i) => <li key={i}>{tip}</li>)}
                             </ul>
                        </div>
                         {panchang.relatedRituals.length > 0 && (
                            <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-md mb-2">Related Rituals</h3>
                                 <div className="flex gap-2">
                                    {panchang.relatedRituals.map(slug => (
                                        <Button key={slug} variant="link" asChild><Link href={`/rituals/${slug}`}>{slug.replace(/-/g, ' ')}</Link></Button>
                                    ))}
                                 </div>
                            </div>
                            </>
                         )}
                     </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    </main>
  );
}
