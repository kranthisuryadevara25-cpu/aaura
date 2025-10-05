
'use client';

import { useParams, notFound } from 'next/navigation';
import { getTempleBySlug } from '@/lib/temples';
import { Header } from '@/app/components/header';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/app/components/navigation';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, BookOpen, Sparkles, AlertTriangle, Users, Building, Utensils, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';


export default function TempleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const temple = getTempleBySlug(slug);

  if (!temple) {
    notFound();
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <Navigation />
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{temple.name}</h1>
                    <p className="mt-2 text-lg text-muted-foreground flex items-center justify-center gap-2">
                        <MapPin className="h-5 w-5" /> {temple.location.city}, {temple.location.state}
                    </p>
                    <div className="mt-4 flex justify-center items-center gap-4">
                        <Badge variant="secondary">Pilgrimage</Badge>
                        <Badge variant="secondary">{temple.deity.name}</Badge>
                         <Button variant="outline" size="sm">
                            <Bookmark className="mr-2 h-4 w-4" /> Bookmark
                        </Button>
                    </div>
                </div>

                {/* Image Carousel */}
                <Carousel className="w-full max-w-5xl mx-auto mb-12">
                    <CarouselContent>
                        {temple.media.images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20">
                                <Image
                                    src={image.url}
                                    alt={`${temple.name} image ${index + 1}`}
                                    data-ai-hint={image.hint}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column (Main Details) */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><BookOpen />Significance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-lg">Mythological Importance</h4>
                                    <p className="text-foreground/90">{temple.importance.mythological}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold text-lg">Historical Importance</h4>
                                    <p className="text-foreground/90">{temple.importance.historical}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                         <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><Sparkles /> Festivals & Special Days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground/90">{temple.visitingInfo.festivals}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Visiting Info) */}
                    <div className="space-y-6">
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><Clock /> Visiting Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p><strong className="text-foreground">Timings:</strong> {temple.visitingInfo.timings}</p>
                                <p><strong className="text-foreground">Dress Code:</strong> {temple.visitingInfo.dressCode}</p>
                                <p><strong className="text-foreground">Pooja Guidelines:</strong> {temple.visitingInfo.poojaGuidelines}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><AlertTriangle /> Nearby Facilities</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <Building className="h-5 w-5 mt-1 shrink-0 text-accent" />
                                    <div><strong className="text-foreground block">Accommodation:</strong> {temple.nearbyInfo.accommodation}</div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <Utensils className="h-5 w-5 mt-1 shrink-0 text-accent" />
                                    <div><strong className="text-foreground block">Food:</strong> {temple.nearbyInfo.food}</div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Plane className="h-5 w-5 mt-1 shrink-0 text-accent" />
                                    <div><strong className="text-foreground block">Transport:</strong> {temple.nearbyInfo.transport}</div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 mt-1 shrink-0 text-accent" />
                                    <div><strong className="text-foreground block">Other Places to Visit:</strong> {temple.nearbyInfo.placesToVisit}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}

    