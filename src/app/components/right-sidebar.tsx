
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { festivals } from '@/lib/festivals';
import { deities } from '@/lib/deities';
import { format } from 'date-fns';
import Image from 'next/image';

export function RightSidebar() {
  const upcomingFestivals = festivals.slice(0, 2);
  const suggestedDeities = deities.slice(0, 2);

  return (
    <aside className="w-full hidden lg:block p-4 space-y-6">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle>Trending Festivals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingFestivals.map((festival) => (
            <div key={festival.id}>
              <p className="font-semibold text-sm">{festival.name}</p>
              <p className="text-xs text-muted-foreground">{format(festival.date, 'MMMM do')}</p>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/festivals">View All</Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle>Suggested Deities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedDeities.map((deity) => (
            <Link key={deity.id} href={`/deities/${deity.slug}`} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={deity.images[0].url} alt={deity.name} data-ai-hint={deity.images[0].hint} fill className="object-cover" />
              </div>
              <div>
                  <p className="font-semibold text-sm group-hover:text-primary">{deity.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{deity.description}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

    </aside>
  );
}
