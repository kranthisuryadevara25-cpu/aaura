
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// This is required to extend the window object for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.productId as string;
    
    const { language } = useLanguage();
    const auth = useAuth();
    const db = useFirestore();
    const { toast } = useToast();
    
    const [user, authLoading] = useAuthState(auth);
    const [product, productLoading] = useDocumentData(doc(db, 'products', productId));
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handlePayment = () => {
        if (!product || !user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Product not found or you are not logged in.',
            });
            return;
        }

        startTransition(async () => {
            try {
                toast({ title: 'Initiating secure payment...' });
                const order = await createRazorpayOrder({
                    amount: product.price * 100, // Amount in paise
                    currency: 'INR',
                    receipt: `receipt_order_${new Date().getTime()}`,
                    productId: productId,
                });
                
                if (!order || !order.id) {
                     throw new Error('Failed to create Razorpay order.');
                }
                
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Aaura',
                    description: `Payment for ${product[`name_${language}`] || product.name_en}`,
                    image: 'https://picsum.photos/seed/logo/128/128', // Replace with your app logo
                    order_id: order.id,
                    handler: async function (response: any) {
                        const batch = writeBatch(db);
                        const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
                        batch.set(orderRef, {
                            id: order.id,
                            userId: user.uid,
                            items: [{
                                productId,
                                quantity: 1,
                                price: product.price,
                                name_en: product.name_en,
                                imageUrl: product.imageUrl,
                            }],
                            totalAmount: product.price,
                            status: 'paid',
                            createdAt: serverTimestamp(),
                            paymentDetails: response,
                        });
                        
                        await batch.commit();

                        toast({
                            title: 'Payment Successful!',
                            description: `Payment ID: ${response.razorpay_payment_id}`,
                        });
                        router.push('/shop');
                    },
                    prefill: {
                        name: user.displayName || 'Aaura User',
                        email: user.email,
                        contact: user.phoneNumber
                    },
                    notes: {
                        productId: productId,
                        userId: user.uid,
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
                console.error("Payment initiation failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Payment Error',
                    description: error.message || 'Could not initiate payment. Please try again.',
                });
            }
        });
    };

    if (authLoading || productLoading) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        );
    }
    
    if (!user) {
        return (
             <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
                <Alert className="max-w-md">
                  <AlertTitle>Please Log In</AlertTitle>
                  <AlertDescription>You need to be logged in to complete a purchase.</AlertDescription>
                </Alert>
            </main>
        )
    }

    if (!product) {
        return <div className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">Product not found.</div>;
    }
    
    const name = product[`name_${language}`] || product.name_en;
    const description = product[`description_${language}`] || product.description_en;


    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Your Purchase</CardTitle>
                    <CardDescription>Review your item and proceed to payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                           <Image src={product.imageUrl} alt={name} fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{name}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
                            <p className="font-bold text-primary text-lg mt-1">₹{product.price.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handlePayment} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Proceed to Pay
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
