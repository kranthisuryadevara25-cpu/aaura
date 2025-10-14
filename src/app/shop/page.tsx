
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, setDoc, serverTimestamp, getDoc, runTransaction, increment } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTransition } from 'react';

export default function ShopPage() {
  const { t, language } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [products, isLoading] = useCollectionData(collection(db, 'products'), { idField: 'id' });
  const [isAdding, startTransition] = useTransition();


  const handleAddToCart = (productId: string, name: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Login Required",
        description: "You must be logged in to add items to your cart.",
      });
      return;
    }

    startTransition(async () => {
        try {
            const cartRef = doc(db, 'users', user.uid, 'cart', productId);

            await runTransaction(db, async (transaction) => {
                const cartDoc = await transaction.get(cartRef);
                const productRef = doc(db, 'products', productId);
                const productSnap = await transaction.get(productRef);

                if (!productSnap.exists()) {
                    throw "Product not found";
                }
                const productData = productSnap.data();

                if (cartDoc.exists()) {
                    transaction.update(cartRef, { quantity: increment(1) });
                } else {
                     transaction.set(cartRef, {
                        productId: productId,
                        quantity: 1,
                        addedAt: serverTimestamp(),
                        price: productData.price,
                        name_en: productData.name_en,
                        imageUrl: productData.imageUrl,
                    });
                }
            });

            toast({
                title: "Added to Cart",
                description: `${name} has been added to your shopping cart.`,
            });
        } catch (error) {
             console.error("Error adding to cart: ", error);
             toast({
                variant: "destructive",
                title: "Failed to Add",
                description: "Could not add the item to your cart. Please try again.",
             });
        }
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
            {products?.map((product: any) => {
                const name = product[`name_${language}`] || product.name_en;
                return (
                <Card key={product.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-0">
                    <div className="aspect-square relative">
                       <Link href={`/shop/${product.id}`}>
                            <Image
                                src={product.imageUrl}
                                alt={name}
                                data-ai-hint={product.imageHint || "product image"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle className="text-foreground">{name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-primary">₹{product.price.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-2">
                    <Button onClick={() => handleAddToCart(product.id, name)} disabled={isAdding}>
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
