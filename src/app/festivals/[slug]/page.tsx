
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckSquare, Sparkles, Loader2, Music, PlayCircle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc } from 'firebase/firestore';
import { useMemo } from 'react';

export default function FestivalDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();
  const db = useFirestore();

  const festivalQuery = useMemo(() => query(collection(db, 'festivals'), where('slug', '==', slug)), [db, slug]);
  const [festivals, isLoading] = useDocumentData(festivalQuery);
  const festival = useMemo(() => festivals?.[0], [festivals]);
  
  const deitySlugs = useMemo(() => festival?.associatedDeities || [], [festival]);
  const productIds = useMemo(() => festival?.relatedProducts || [], [festival]);
  
  const deitiesQuery = useMemo(() => deitySlugs.length > 0 ? query(collection(db, 'deities'), where('__name__', 'in', deitySlugs)) : undefined, [db, deitySlugs]);
  const [associatedDeities, loadingDeities] = useCollectionData(deitiesQuery, { idField: 'id' });
  
  const productsQuery = useMemo(() => productIds.length > 0 ? query(collection(db, 'products'), where('__name__', 'in', productIds)) : undefined, [db, productIds]);
  const [relatedProducts, loadingProducts] = useCollectionData(productsQuery, { idField: 'id' });

  const pageLoading = isLoading;

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  if (!pageLoading && !festival) {
    notFound();
  }
  
  if (!festival) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  const name = (festival.name as any)[language] || festival.name.en;
  const description = (festival.description as any)[language] || festival.description.en;
  const significance = (festival.significance as any)[language] || festival.significance.en;
  const rituals = (festival.rituals as any)[language] || festival.rituals.en;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-6xl mx-auto">
            <header className="text-center mb-8">
                <Badge variant="default" className="text-lg mb-2">
                    <Calendar className="mr-2" /> {format(new Date(festival.date), 'MMMM do, yyyy')}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{description}</p>
            </header>

            <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                <Image
                    src={festival.image.url}
                    alt={name}
                    data-ai-hint={festival.image.hint}
                    fill
                    className="object-cover"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                      <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><Sparkles /> {t.festivalDetail.significance}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/90">{significance}</p>
                        </CardContent>
                    </Card>
                      <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><CheckSquare /> {t.festivalDetail.keyRituals}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-foreground/90">
                                {rituals.map((ritual: string, index: number) => (
                                    <li key={index}>{ritual}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6 lg:sticky top-24 h-fit">
                    {associatedDeities && associatedDeities.length > 0 && (
                    <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle>{t.festivalDetail.associatedDeities}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {associatedDeities.map((deity: any) => (
                                <Link key={deity.id} href={`/deities/${deity.slug}`} className="group flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                                        <Image src={deity.images[0].url} alt={deity.name[language] || deity.name.en} data-ai-hint={deity.images[0].hint} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm group-hover:text-primary">{deity.name[language] || deity.name.en}</p>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                    )}
                    {festival.recommendedPlaylist && (
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><Music /> Festival Playlist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold text-foreground">{festival.recommendedPlaylist.title}</p>
                                <Button asChild variant="outline" className="w-full mt-4">
                                  <Link href={`/playlists/${festival.recommendedPlaylist.id}`}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Listen Now
                                  </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <Card className="bg-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-primary"><ShoppingCart /> Shop Essentials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                               {relatedProducts.map((product: any) => (
                                   <Link key={product.id} href={`/shop/${product.id}`} className="group flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                                       <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                                           <Image src={product.imageUrl} alt={product.name_en} data-ai-hint={product.imageHint} fill className="object-cover" />
                                       </div>
                                       <div>
                                           <p className="font-semibold text-sm group-hover:text-primary">{product.name_en}</p>
                                           <p className="text-xs text-muted-foreground">₹{product.price.toFixed(2)}</p>
                                       </div>
                                   </Link>
                               ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </article>
    </main>
  );
}

    