
'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, Heart, Plus, Minus, Check } from 'lucide-react';
import { monetizationPlans } from '@/lib/plans';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { cn } from '@/lib/utils';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order'; // Assuming a similar flow exists
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { Label } from '@/components/ui/label';


declare global {
    interface Window {
        Razorpay: any;
    }
}

export function SupportDialog() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(monetizationPlans[0].id);
  const [isProcessing, startProcessing] = useTransition();
  const [quantity, setQuantity] = useState(1);

  const plan = monetizationPlans.find(p => p.id === selectedPlan);
  const totalAmount = plan ? plan.amount * quantity : 0;
  
  const handlePayment = () => {
     if (!user || !plan) {
         toast({ variant: 'destructive', title: 'Please log in to proceed.' });
         return;
     }

     startProcessing(async () => {
         // This is a placeholder for creating a transaction/order record
         // In a real app, you would call a server-side function to create a payment intent with Razorpay/Stripe
         try {
            toast({ title: 'Initiating secure payment...', description: 'Please wait.' });
            
            // This is a placeholder for a real payment flow.
            // A real implementation would involve creating a Razorpay order,
            // opening the checkout, and handling the response.
            // For now, we'll simulate a successful transaction.

            const batch = writeBatch(db);
            const transactionRef = doc(collection(db, 'transactions'));
            batch.set(transactionRef, {
                userId: user.uid,
                planId: plan.id,
                quantity: quantity,
                totalAmount: totalAmount,
                status: 'completed', // Mocking completion
                createdAt: serverTimestamp(),
                paymentGatewayId: `mock_${Date.now()}`
            });

            await batch.commit();

            toast({ title: 'Thank you for your support!', description: 'Your contribution is greatly appreciated.' });
            setIsOpen(false);

         } catch (error: any) {
             console.error("Payment processing error:", error);
             toast({ variant: 'destructive', title: 'Payment Failed', description: error.message || 'An unknown error occurred.' });
         }
     })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
          <Heart className="mr-2 h-4 w-4" /> Support Us
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support Aaura's Mission</DialogTitle>
          <DialogDescription>
            Your contribution helps us continue to provide and grow this spiritual resource for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {monetizationPlans.map((p) => (
                <Card 
                    key={p.id}
                    onClick={() => { setSelectedPlan(p.id); setQuantity(1); }}
                    className={cn(
                        "cursor-pointer transition-all",
                        selectedPlan === p.id ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
                    )}
                >
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div className="space-y-1">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                            <CardDescription className="text-xs">{p.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-lg font-bold">₹{p.amount}</p>
                            {p.period === 'year' && <p className="text-xs text-muted-foreground">per year</p>}
                        </div>
                    </CardHeader>
                    {selectedPlan === p.id && p.period === 'one-time' && (
                        <CardContent>
                             <div className="flex items-center gap-2">
                                <Label htmlFor="quantity" className="text-sm">Quantity:</Label>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)) }} disabled={quantity <= 1}><Minus className="h-4 w-4"/></Button>
                                <span className="font-bold w-8 text-center">{quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1) }}><Plus className="h-4 w-4"/></Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
            Contribute ₹{totalAmount.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
