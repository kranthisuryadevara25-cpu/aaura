
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { useTransition } from 'react';
import { getProductById } from '@/lib/products';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isAdding, startTransition] = useTransition();

  const product = getProductById(productId);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Login Required",
        description: "You must be logged in to add items to your cart.",
      });
      return;
    }
     if (!product) return;

    startTransition(async () => {
        try {
            const cartRef = doc(db, 'users', user.uid, 'cart', product.id);

            await runTransaction(db, async (transaction) => {
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

  if (!product) {
    return notFound();
  }

  const name = product[`name_${language}` as keyof typeof product] || product.name_en;
  const description = product[`description_${language}` as keyof typeof product] || product.description_en;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;


  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
        <div>
           <Card className="overflow-hidden">
             <div className="aspect-square relative">
                <Image
                    src={product.imageUrl}
                    alt={name}
                    data-ai-hint={product.imageHint || 'product'}
                    fill
                    className="object-cover"
                />
                 {hasDiscount && (
                    <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-lg">
                        {discountPercent}% OFF
                    </Badge>
                )}
             </div>
           </Card>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-primary">{name}</h1>
            <div className="flex items-baseline gap-4 mt-4">
              <p className="text-3xl font-semibold">₹{product.price.toFixed(2)}</p>
               {hasDiscount && (
                  <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
              )}
          </div>
          <Card className="mt-6 bg-transparent border-primary/20">
            <CardHeader>
                <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
          <Button size="lg" className="mt-8 w-full" onClick={handleAddToCart} disabled={isAdding}>
             {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
             {t.buttons.addToCart}
          </Button>
        </div>
      </div>
    </main>
  );
}
