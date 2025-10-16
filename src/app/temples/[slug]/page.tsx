
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, BookOpen, Sparkles, Building, Utensils, Plane, Users, Bookmark, Loader2, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { getTempleBySlug } from '@/lib/temples';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Posts } from '@/components/Posts';


const getText = (field: { [key: string]: string } | undefined, lang: string = 'en') => {
    if (!field) return "";
    return field[lang] || field.en || Object.values(field)[0] || "";
};

function InfoCard({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) {
    return (
        <Card className="bg-transparent border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary"><Icon className="h-5 w-5" />{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {children}
            </CardContent>
        </Card>
    )
}

function ContactList({ items }: { items?: { name?: string, phone?: string }[] }) {
    if (!items || items.length === 0) return <p className="text-muted-foreground">Not available.</p>;
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    {item.phone && <a href={`tel:${item.phone}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-3 w-3" /> {item.phone}</a>}
                </div>
            ))}
        </div>
    )
}


function TempleInfo({ temple, language }: { temple: any, language: string }) {
    const { t } = useLanguage();
    const mythologicalImportance = getText(temple.importance.mythological, language);
    const historicalImportance = getText(temple.importance.historical, language);
    const festivals = getText(temple.visitingInfo.festivals, language);
    const timings = getText(temple.visitingInfo.timings, language);
    const dressCode = getText(temple.visitingInfo.dressCode, language);
    const poojaGuidelines = getText(temple.visitingInfo.poojaGuidelines, language);
    
    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
            <div className="lg:col-span-2 space-y-8">
                <InfoCard title={t.templeDetail.significance} icon={BookOpen}>
                    <div>
                        <h4 className="font-semibold text-lg">{t.templeDetail.mythologicalImportance}</h4>
                        <p className="text-foreground/90">{mythologicalImportance}</p>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold text-lg">{t.templeDetail.historicalImportance}</h4>
                        <p className="text-foreground/90">{historicalImportance}</p>
                    </div>
                </InfoCard>
                
                <InfoCard title={t.templeDetail.festivals} icon={Sparkles}>
                    <p className="text-foreground/90">{festivals}</p>
                </InfoCard>
            </div>

            <div className="space-y-6">
                <InfoCard title={t.templeDetail.visitingInfo} icon={Clock}>
                    <p><strong className="text-foreground">{t.templeDetail.timings}:</strong> {timings}</p>
                    <p><strong className="text-foreground">{t.templeDetail.dressCode}:</strong> {dressCode}</p>
                    <p><strong className="text-foreground">{t.templeDetail.poojaGuidelines}:</strong> {poojaGuidelines}</p>
                </InfoCard>

                <InfoCard title={t.templeDetail.travelFacilities} icon={Plane}>
                    <h4 className="font-bold text-md flex items-center gap-2"><Building className="h-4 w-4" />{t.templeDetail.accommodation}</h4>
                    <ContactList items={temple.nearbyInfo.accommodation} />
                    <Separator />
                    <h4 className="font-bold text-md flex items-center gap-2"><Utensils className="h-4 w-4" />{t.templeDetail.food}</h4>
                    <ContactList items={temple.nearbyInfo.food} />
                    <Separator />
                    <h4 className="font-bold text-md flex items-center gap-2"><Plane className="h-4 w-4" />{t.templeDetail.transport}</h4>
                    <ContactList items={temple.nearbyInfo.transport} />
                     <Separator />
                    <h4 className="font-bold text-md flex items-center gap-2"><Users className="h-4 w-4" />Suggested Guides</h4>
                    <ContactList items={temple.nearbyInfo.guides} />
                </InfoCard>
            </div>
        </div>
    )
}


export default function TempleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const temple = getTempleBySlug(slug);
  const loading = false;
  const bookmark = false; // Mock data
  const isBookmarkLoading = false; // Mock data

  const handleBookmark = async () => {
    if (!user || !temple) {
        toast({ variant: 'destructive', title: 'You must be logged in to bookmark a temple.' });
        return;
    }
    toast({ title: 'Bookmark functionality is currently mocked.' });
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  if (!loading && !temple) {
    notFound();
  }

  if (!temple) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  const name = getText(temple.name, language);
  const deityName = getText(temple.deity.name, language);
  const mythologicalImportance = getText(temple.importance.mythological, language);
  
  const templeJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: name,
      description: mythologicalImportance,
      image: temple.media.images.map((img: any) => img.url),
      address: {
        '@type': 'PostalAddress',
        streetAddress: temple.location.address,
        addressLocality: temple.location.city,
        addressRegion: temple.location.state,
        postalCode: temple.location.pincode,
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: temple.location.geo.lat,
        longitude: temple.location.geo.lng
      },
      ...(temple.officialWebsite && { url: temple.officialWebsite })
  };


  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(templeJsonLd) }}
        />

        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
            <p className="mt-2 text-lg text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" /> {temple.location.city}, {temple.location.state}
            </p>
            <div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
                <Badge variant="secondary">Pilgrimage</Badge>
                <Badge variant="secondary">{deityName}</Badge>
                <Button variant="outline" size="sm" onClick={handleBookmark} disabled={isBookmarkLoading}>
                    <Bookmark className={`mr-2 h-4 w-4 ${bookmark ? 'fill-yellow-400 text-yellow-500' : ''}`} /> {t.buttons.bookmark}
                </Button>
                {temple.officialWebsite && (
                     <Button variant="outline" size="sm" asChild>
                        <a href={temple.officialWebsite} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2 h-4 w-4" /> Official Website
                        </a>
                    </Button>
                )}
            </div>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto mb-12">
            <CarouselContent>
                {temple.media.images.map((image: any, index: number) => (
                <CarouselItem key={index}>
                    <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20">
                        <Image
                            src={image.url}
                            alt={`${name} image ${index + 1}`}
                            data-ai-hint={image.hint}
                            fill
                            priority={index === 0}
                            className="object-cover"
                        />
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>

        <Tabs defaultValue="info" className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Temple Information</TabsTrigger>
                <TabsTrigger value="community">Community Discussion</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
                <TempleInfo temple={temple} language={language} />
            </TabsContent>
            <TabsContent value="community">
                <div className="max-w-4xl mx-auto mt-8">
                     <Posts contextId={temple.slug} contextType="temple" />
                </div>
            </TabsContent>
        </Tabs>
    </main>
  );
}

    