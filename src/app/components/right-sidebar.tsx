
'use client';
import { useLanguage } from "@/hooks/use-language";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, limit, query, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { Loader2 } from "lucide-react";


export function RightSidebar() {
  const { language, t } = useLanguage();
  const db = useFirestore();

  const festivalsQuery = query(collection(db, 'festivals'), limit(3));
  const [upcomingFestivals, festivalsLoading] = useCollectionData(festivalsQuery, { idField: 'id' });

  const deitiesQuery = query(collection(db, 'deities'), limit(3));
  const [suggestedDeities, deitiesLoading] = useCollectionData(deitiesQuery, { idField: 'id' });

  return (
    <div className="space-y-8 sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle>{t.rightSidebar.trendingFestivals}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {festivalsLoading ? <Loader2 className="mx-auto animate-spin" /> : upcomingFestivals?.map((festival: DocumentData) => (
            <Link href={`/festivals/${festival.slug}`} key={festival.id} className="block group">
              <div className="flex items-center gap-3">
                 <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                    <Image src={festival.image.url} alt={festival.name[language] || festival.name.en} fill className="object-cover" />
                 </div>
                 <div>
                    <p className="font-semibold text-sm group-hover:text-primary">{festival.name[language] || festival.name.en}</p>
                    <p className="text-xs text-muted-foreground">{new Date(festival.date.toDate()).toLocaleDateString(language, { month: 'long', day: 'numeric' })}</p>
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
          {deitiesLoading ? <Loader2 className="mx-auto animate-spin" /> : suggestedDeities?.map((deity: DocumentData) => (
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
