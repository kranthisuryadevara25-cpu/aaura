
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/lib/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const products = [
    { id: '1', name: 'Handcrafted Ganesha Idol', price: 49.99, imageUrl: 'https://picsum.photos/seed/idol/400/400', imageHint: 'Ganesha idol', description: 'A beautiful, handcrafted Ganesha idol for your home altar.' },
    { id: '2', name: 'Premium Sandalwood Incense Sticks', price: 12.99, imageUrl: 'https://picsum.photos/seed/incense/400/400', imageHint: 'incense sticks', description: 'Create a serene atmosphere with these aromatic incense sticks.' },
    { id: '3', name: 'The Bhagavad Gita: A New Translation', price: 19.99, imageUrl: 'https://picsum.photos/seed/book/400/400', imageHint: 'spiritual book', description: 'A modern, accessible translation of the timeless Hindu scripture.' },
    { id: '4', name: 'Brass Pooja Thali Set', price: 79.99, imageUrl: 'https://picsum.photos/seed/thali/400/400', imageHint: 'pooja thali', description: 'A complete set for your daily pooja rituals, made from pure brass.' },
];

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const params = useParams();
    const productId = params.productId as string;
    const product = products.find(p => p.id === productId);

    const auth = useAuth();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
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
                const order = await createRazorpayOrder({
                    amount: product.price * 100, // Amount in paise
                    currency: 'INR',
                    receipt: `receipt_order_${new Date().getTime()}`,
                    productId: product.id,
                });
                
                if (!order || !order.id) {
                     throw new Error('Failed to create Razorpay order.');
                }
                
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Aaura Super App',
                    description: `Payment for ${product.name}`,
                    image: 'https://picsum.photos/seed/logo/128/128',
                    order_id: order.id,
                    handler: function (response: any) {
                        toast({
                            title: 'Payment Successful!',
                            description: `Payment ID: ${response.razorpay_payment_id}`,
                        });
                        // Here you would typically verify the payment signature on your backend
                        // and then update the order status in Firestore.
                    },
                    prefill: {
                        name: user.displayName || 'Aaura User',
                        email: user.email,
                    },
                    theme: {
                        color: '#F59E0B',
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

            } catch (error) {
                console.error("Payment initiation failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Payment Error',
                    description: 'Could not initiate payment. Please try again.',
                });
            }
        });
    };

    if (!product) {
        return <div className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">Product not found.</div>;
    }

    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Your Purchase</CardTitle>
                    <CardDescription>Review your item and proceed to payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 rounded-md overflow-hidden">
                           <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-muted-foreground text-sm">{product.description}</p>
                            <p className="font-bold text-primary text-lg mt-1">${product.price.toFixed(2)}</p>
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
