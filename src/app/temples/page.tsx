
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Palmtree, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';

export default function TemplesPage() {
  const { language, t } = useLanguage();
  const db = useFirestore();
  const templesRef = collection(db, 'temples');
  const [temples, isLoading] = useCollectionData(templesRef, { idField: 'id' });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                    <Palmtree className="h-10 w-10" /> {t.temples.title}
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                    {t.temples.description}
                </p>
            </div>
             <Button asChild>
                <Link href="/admin/temples/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Temple
                </Link>
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {temples?.map((temple: any) => {
            const name = (temple.name as any)[language] || temple.name.en;
            
            return (
                <Card key={temple.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={temple.media.images[0].url}
                                alt={name}
                                data-ai-hint={temple.media.images[0].hint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-primary">{name}</CardTitle>
                        <CardDescription className="line-clamp-3">{temple.location.city}, {temple.location.state}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/temples/${temple.slug}`}>
                                {t.buttons.explore} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )
            })}
            </div>
        )}
    </main>
  );
}
