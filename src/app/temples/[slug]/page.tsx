
import { notFound } from 'next/navigation';
import { getTempleBySlug, temples } from '@/lib/temples';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, BookOpen, Sparkles, Building, Utensils, Plane, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { translations } from '@/translations';

// Generate static pages for all temples at build time
export function generateStaticParams() {
  return temples.map((temple) => ({
    slug: temple.slug,
  }));
}

// Helper to get text based on a "language" - for server components, we'd get lang from params or headers
// For this static generation example, we will default to English ('en')
const getText = (field: { [key: string]: string } | undefined, lang: string = 'en') => {
    if (!field) return "";
    return field[lang] || field.en || Object.values(field)[0] || "";
};

export default function TempleDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const temple = getTempleBySlug(slug);

  if (!temple) {
    notFound();
  }

  // We'll use 'en' as the default language for this server-rendered page.
  // In a more dynamic app, this could come from user preference or headers.
  const language = 'en';
  const t = translations[language];

  const name = getText(temple.name, language);
  const deityName = getText(temple.deity.name, language);
  const mythologicalImportance = getText(temple.importance.mythological, language);
  const historicalImportance = getText(temple.importance.historical, language);
  const festivals = getText(temple.visitingInfo.festivals, language);
  const timings = getText(temple.visitingInfo.timings, language);
  const dressCode = getText(temple.visitingInfo.dressCode, language);
  const poojaGuidelines = getText(temple.visitingInfo.poojaGuidelines, language);
  const accommodation = getText(temple.nearbyInfo.accommodation, language);
  const food = getText(temple.nearbyInfo.food, language);
  const transport = getText(temple.nearbyInfo.transport, language);
  const placesToVisit = getText(temple.nearbyInfo.placesToVisit, language);
  
  const templeJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: name,
      description: mythologicalImportance,
      image: temple.media.images.map(img => img.url),
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
      }
  };


  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(templeJsonLd) }}
        />

        {/* Header Section */}
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
            <p className="mt-2 text-lg text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" /> {temple.location.city}, {temple.location.state}
            </p>
            <div className="mt-4 flex justify-center items-center gap-4">
                <Badge variant="secondary">Pilgrimage</Badge>
                <Badge variant="secondary">{deityName}</Badge>
                  <Button variant="outline" size="sm">
                    <Bookmark className="mr-2 h-4 w-4" /> {t.buttons.bookmark}
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
                            alt={`${name} image ${index + 1}`}
                            data-ai-hint={image.hint}
                            fill
                            priority={index === 0} // Prioritize loading the first image
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
                        <CardTitle className="flex items-center gap-3 text-primary"><BookOpen />{t.templeDetail.significance}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-lg">{t.templeDetail.mythologicalImportance}</h4>
                            <p className="text-foreground/90">{mythologicalImportance}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-lg">{t.templeDetail.historicalImportance}</h4>
                            <p className="text-foreground/90">{historicalImportance}</p>
                        </div>
                    </CardContent>
                </Card>
                
                  <Card className="bg-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary"><Sparkles /> {t.templeDetail.festivals}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90">{festivals}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column (Visiting Info) */}
            <div className="space-y-6">
                <Card className="bg-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary"><Clock /> {t.templeDetail.visitingInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><strong className="text-foreground">{t.templeDetail.timings}:</strong> {timings}</p>
                        <p><strong className="text-foreground">{t.templeDetail.dressCode}:</strong> {dressCode}</p>
                        <p><strong className="text-foreground">{t.templeDetail.poojaGuidelines}:</strong> {poojaGuidelines}</p>
                    </CardContent>
                </Card>

                <Card className="bg-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary">{t.templeDetail.travelFacilities}</CardTitle>
                    </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Building className="h-5 w-5 mt-1 shrink-0 text-accent" />
                            <div><strong className="text-foreground block">{t.templeDetail.accommodation}:</strong> {accommodation}</div>
                        </div>
                          <div className="flex items-start gap-3">
                            <Utensils className="h-5 w-5 mt-1 shrink-0 text-accent" />
                            <div><strong className="text-foreground block">{t.templeDetail.food}:</strong> {food}</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Plane className="h-5 w-5 mt-1 shrink-0 text-accent" />
                            <div><strong className="text-foreground block">{t.templeDetail.transport}:</strong> {transport}</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 mt-1 shrink-0 text-accent" />
                            <div><strong className="text-foreground block">{t.templeDetail.placesToVisit}:</strong> {placesToVisit}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    </main>
  );
}
