
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';

export default function ShopPage() {
  const { t, language } = useLanguage();
  const db = useFirestore();
  const [products, isLoading] = useCollectionData(collection(db, 'products'), { idField: 'id' });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">{t.shop.title}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.shop.description}
            </p>
        </div>

        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product: any) => {
                const name = product[`name_${language}`] || product.name_en;
                return (
                <Card key={product.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-square relative">
                        <Image
                            src={product.imageUrl}
                            alt={name}
                            data-ai-hint={product.imageHint || "product image"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-foreground">{name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-2">
                    <Button className="w-full">
                        <ShoppingCart className="mr-2" />
                        {t.buttons.addToCart}
                    </Button>
                    <Button asChild className="w-full" variant="secondary">
                    <Link href={`/checkout/${product.id}`}>
                        {t.buttons.buyNow}
                    </Link>
                    </Button>
                </CardContent>
                </Card>
            )})}
            </div>
        )}
    </main>
  );
}
