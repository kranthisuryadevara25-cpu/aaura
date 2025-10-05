'use client';

import { Header } from '@/app/components/header';
import { getTodaysPanchang } from '@/lib/panchang';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { CalendarDays, Sunrise, Sunset, Moon, Star, AlertTriangle, PartyPopper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PanchangPage() {
    const panchang = getTodaysPanchang();

    const panchangItems = [
        { icon: Star, label: "Tithi", value: panchang.tithi },
        { icon: Star, label: "Nakshatra", value: panchang.nakshatra },
        { icon: Star, label: "Yoga", value: panchang.yoga },
        { icon: Star, label: "Karana", value: panchang.karana },
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


  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
              <Navigation />
          </Sidebar>
          <SidebarInset>
              <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                  <div className="text-center mb-12">
                      <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                          <CalendarDays className="h-10 w-10" /> Daily Panchang
                      </h1>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                          {panchang.date}
                      </p>
                  </div>
                  
                  <div className="max-w-6xl mx-auto space-y-8">
                    {panchang.festivals.length > 0 && (
                        <Card className="bg-primary/10 border-primary/20">
                            <CardHeader className="flex-row items-center gap-4">
                                <PartyPopper className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle className="text-primary">Today's Festivals</CardTitle>
                                    <CardDescription>{panchang.festivals.join(', ')}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {panchangItems.map((item, index) => (
                            <Card key={index} className="bg-transparent border-primary/20 text-center">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg text-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold text-muted-foreground">{item.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle>Astronomical Timings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {timings.map((item, index) => (
                                     <div key={index} className="flex justify-between items-center text-foreground/90">
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5 text-accent" />
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="font-mono font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle>Inauspicious Timings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {inauspiciousTimings.map((item, index) => (
                                     <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                            <span className="text-foreground/90">{item.label}</span>
                                        </div>
                                        <span className="font-mono font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                  </div>
              </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
