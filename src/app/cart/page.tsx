
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { collection, doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CartPage() {
  const { t } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCheckingOut, startCheckoutTransition] = useTransition();

  const cartRef = user ? collection(db, 'users', user.uid, 'cart') : undefined;
  const [cartItems, cartLoading] = useCollectionData(cartRef, { idField: 'id' });

  const totalAmount = cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleRemoveFromCart = (productId: string) => {
    if (!user) return;
    startDeleteTransition(async () => {
      try {
        const itemRef = doc(db, 'users', user.uid, 'cart', productId);
        await deleteDoc(itemRef);
        toast({ title: 'Item removed from cart.' });
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast({ variant: 'destructive', title: 'Failed to remove item.' });
      }
    });
  };

  const handleCheckout = () => {
    if (!user || !cartItems || cartItems.length === 0) return;

    startCheckoutTransition(async () => {
      try {
        // For this example, we'll create an order for the whole cart.
        // A real implementation would create line items.
        // We'll use the first product's ID for the AI flow for now.
        const firstProduct = cartItems[0];
        
        toast({ title: 'Initiating secure payment...' });

        // The AI flow is designed for a single product ID verification.
        // For a multi-item cart, we pass the first one for the server-side price check logic.
        // The total amount is what's actually charged.
        const order = await createRazorpayOrder({
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_cart_${new Date().getTime()}`,
            productId: firstProduct.productId, 
        });
        
        if (!order || !order.id) {
             throw new Error('Failed to create Razorpay order.');
        }
        
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Aaura',
            description: `Payment for ${cartItems.length} items`,
            image: 'https://picsum.photos/seed/logo/128/128',
            order_id: order.id,
            handler: async function (response: any) {
                // On successful payment, move cart items to an order document
                const batch = writeBatch(db);
                const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
                batch.set(orderRef, {
                    id: orderRef.id,
                    userId: user.uid,
                    items: cartItems,
                    totalAmount: totalAmount,
                    status: 'paid',
                    createdAt: serverTimestamp(),
                    paymentDetails: {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }
                });

                // Clear the cart
                cartItems.forEach(item => {
                    const cartItemRef = doc(db, 'users', user.uid, 'cart', item.id);
                    batch.delete(cartItemRef);
                });

                await batch.commit();

                toast({
                    title: 'Payment Successful!',
                    description: `Your order has been placed.`,
                });
                router.push('/shop');
            },
            prefill: {
                name: user.displayName || 'Aaura User',
                email: user.email,
                contact: user.phoneNumber
            },
            theme: {
                color: '#E6E6FA', // Soft Lavender
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: response.error.description,
            });
        });
        rzp.open();

      } catch (error: any) {
        console.error("Checkout failed:", error);
        toast({
            variant: 'destructive',
            title: 'Checkout Error',
            description: error.message || 'Could not initiate checkout. Please try again.',
        });
      }
    });
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
     return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (authLoading || cartLoading) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart /> Your Shopping Cart
            </CardTitle>
            <CardDescription>
                Review the items in your cart before proceeding to checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cartItems && cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-md border">
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                        <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" />
                        </div>
                        <div>
                        <h3 className="font-semibold">{item.name_en}</h3>
                        <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                        <p className="font-bold text-primary text-md mt-1">₹{item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromCart(item.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="mx-auto h-24 w-24 opacity-30" />
                <p className="mt-4">Your cart is empty.</p>
              </div>
            )}
          </CardContent>
          {cartItems && cartItems.length > 0 && (
             <CardFooter className="flex-col items-stretch gap-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button className="w-full" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Proceed to Checkout
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
