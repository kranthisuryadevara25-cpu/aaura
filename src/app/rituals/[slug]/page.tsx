
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, ShoppingBasket, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';

export default function RitualDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();
  const db = useFirestore();

  const ritualsQuery = query(collection(db, 'rituals'), where('slug', '==', slug));
  const [rituals, isLoading] = useCollectionData(ritualsQuery);
  const ritual = rituals?.[0];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  if (!ritual) {
    notFound();
  }
  
  const name = ritual.name[language] || ritual.name.en;
  const description = ritual.description[language] || ritual.description.en;
  const deity = ritual.deity[language] || ritual.deity.en;
  const auspiciousTime = ritual.auspiciousTime[language] || ritual.auspiciousTime.en;
  const procedure = ritual.procedure[language] || ritual.procedure.en;
  const itemsRequired = ritual.itemsRequired[language] || ritual.itemsRequired.en;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <Badge variant="default" className="mb-2">{deity}</Badge>
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">{name}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{description}</p>
            </header>

            <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-accent/20 mb-8">
                <Image
                    src={ritual.image.url}
                    alt={name}
                    data-ai-hint={ritual.image.hint}
                    fill
                    className="object-cover"
                />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                      <Card className="bg-transparent border-primary/20 mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><CheckSquare /> {t.ritualDetail.procedure}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal list-inside space-y-4 text-foreground/90">
                                {procedure.map((step: string, index: number) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="bg-transparent border-primary/20 sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><ShoppingBasket /> {t.ritualDetail.itemsRequired}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-foreground/90">
                                {itemsRequired.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                      <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><Clock /> {t.ritualDetail.auspiciousTime}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/90">{auspiciousTime}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </article>
    </main>
  );
}
