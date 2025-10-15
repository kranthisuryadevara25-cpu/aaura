
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, ShoppingBasket, Clock, Loader2, BookOpen, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { getRitualBySlug } from '@/lib/rituals';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function RitualDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();
  
  const ritual = getRitualBySlug(slug);
  const isLoading = false;

  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  if (!isLoading && !ritual) {
    notFound();
  }

  if (!ritual) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  const name = ritual.name[language] || ritual.name.en;
  const description = ritual.description[language] || ritual.description.en;
  const deity = ritual.deity[language] || ritual.deity.en;
  const auspiciousTime = ritual.auspiciousTime[language] || ritual.auspiciousTime.en;
  const procedure = ritual.procedure[language] || ritual.procedure.en || [];
  const itemsRequired = ritual.itemsRequired[language] || ritual.itemsRequired.en || [];
  const significance = ritual.significance[language] || ritual.significance.en;
  const benefits = ritual.benefits[language] || ritual.benefits.en || [];
  const commonMistakes = ritual.commonMistakes[language] || ritual.commonMistakes.en || [];


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
                <div className="md:col-span-2 space-y-8">
                      <Card className="bg-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><BookOpen /> Significance & Benefits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-foreground/90">{significance}</p>
                            <Separator/>
                            <h4 className="font-semibold text-md">Benefits:</h4>
                             <ul className="list-disc list-inside space-y-2 text-foreground/80">
                                {benefits.map((benefit: string, index: number) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                      <Card className="bg-transparent border-primary/20">
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
                      <Card className="bg-transparent border-destructive/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-destructive"><AlertTriangle /> Common Mistakes to Avoid</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="list-disc list-inside space-y-2 text-foreground/80">
                                {commonMistakes.map((mistake: string, index: number) => (
                                    <li key={index}>{mistake}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="bg-transparent border-primary/20 sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-primary"><ShoppingBasket /> {t.ritualDetail.itemsRequired}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {itemsRequired.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-3">
                                  <Checkbox 
                                    id={`item-${index}`} 
                                    onCheckedChange={() => handleCheck(item)}
                                    checked={checkedItems.includes(item)}
                                  />
                                  <label htmlFor={`item-${index}`} className={`text-sm ${checkedItems.includes(item) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {item}
                                  </label>
                                </div>
                            ))}
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
