// src/app/components/right-sidebar.tsx
'use client';
import { useLanguage } from "@/hooks/use-language";
import { festivals } from "@/lib/festivals";
import { deities } from "@/lib/deities";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RightSidebar() {
  const { language, t } = useLanguage();

  const upcomingFestivals = festivals.slice(0, 3);
  const suggestedDeities = deities.slice(0, 3);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t.rightSidebar.trendingFestivals}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingFestivals.map(festival => (
            <Link href={`/festivals/${festival.slug}`} key={festival.id} className="block group">
              <div className="flex items-center gap-3">
                 <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                    <Image src={festival.image.url} alt={festival.name[language] || festival.name.en} fill className="object-cover" />
                 </div>
                 <div>
                    <p className="font-semibold text-sm group-hover:text-primary">{festival.name[language] || festival.name.en}</p>
                    <p className="text-xs text-muted-foreground">{new Date(festival.date).toLocaleDateString(language, { month: 'long', day: 'numeric' })}</p>
                 </div>
              </div>
            </Link>
          ))}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/festivals">{t.rightSidebar.viewAll}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.rightSidebar.suggestedDeities}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedDeities.map(deity => (
            <Link href={`/deities/${deity.slug}`} key={deity.id} className="block group">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                        <Image src={deity.images[0].url} alt={deity.name[language] || deity.name.en} fill className="object-cover" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm group-hover:text-primary">{deity.name[language] || deity.name.en}</p>
                         <p className="text-xs text-muted-foreground line-clamp-1">{deity.description[language] || deity.description.en}</p>
                    </div>
                </div>
            </Link>
          ))}
           <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/deities">{t.rightSidebar.viewAll}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
