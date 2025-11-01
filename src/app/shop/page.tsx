
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { doc, setDoc, serverTimestamp, runTransaction, increment, collection } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState, useTransition, useMemo } from 'react';
import { productConverter, type Product } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { useCollection } from 'react-firebase-hooks/firestore';

export default function ShopPage() {
  const { t, language } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const productsRef = collection(db, 'products').withConverter(productConverter);
  const [snapshot, isLoading] = useCollection(productsRef);
  
  const products = useMemo(() => snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [snapshot]);


  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Login Required",
        description: "You must be logged in to add items to your cart.",
      });
      return;
    }
    
    setAddingProductId(product.id);

    runTransaction(db, async (transaction) => {
        const cartRef = doc(db, 'users', user.uid, 'cart', product.id);
        const cartDoc = await transaction.get(cartRef);
        
        if (cartDoc.exists()) {
            transaction.update(cartRef, { quantity: increment(1) });
        } else {
             transaction.set(cartRef, {
                productId: product.id,
                quantity: 1,
                addedAt: serverTimestamp(),
                price: product.price,
                name_en: product.name_en,
                imageUrl: product.imageUrl,
                shopId: product.shopId,
            });
        }
    }).then(() => {
        toast({
            title: "Added to Cart",
            description: `${product.name_en} has been added to your shopping cart.`,
        });
    }).catch((error) => {
        console.error("Error adding to cart: ", error);
         toast({
            variant: "destructive",
            title: "Failed to Add",
            description: "Could not add the item to your cart. Please try again.",
         });
    }).finally(() => {
        setAddingProductId(null);
    });
  };

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
            {products?.map((product: Product) => {
                const name = product[`name_${language}` as keyof typeof product] || product.name_en;
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                const isAdding = addingProductId === product.id;

                return (
                <Card key={product.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-square relative">
                       <Link href={`/shop/${product.id}`}>
                            <Image
                                src={product.imageUrl}
                                alt={name as string}
                                data-ai-hint={product.imageHint || "product image"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                        {hasDiscount && (
                            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                                {discountPercent}% OFF
                            </Badge>
                        )}
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-foreground">{name as string}</CardTitle>
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg font-semibold text-primary">₹{product.price.toFixed(2)}</p>
                        {hasDiscount && (
                             <p className="text-sm text-muted-foreground line-through">₹{product.originalPrice!.toFixed(2)}</p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-2">
                    <Button onClick={() => handleAddToCart(product)} disabled={isAdding}>
                      {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                      {t.buttons.addToCart}
                    </Button>
                </CardContent>
                </Card>
            )})}
            </div>
        )}
    </main>
  );
}
