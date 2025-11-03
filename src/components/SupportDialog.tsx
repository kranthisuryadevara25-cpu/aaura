
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
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
import { Loader2, Heart, Plus, Minus } from 'lucide-react';
import { monetizationPlans, type Plan } from '@/lib/plans';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { createPaymentOrder } from '@/ai/flows/create-payment-order';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Input } from './ui/input';


declare global {
    interface Window {
        Razorpay: any;
    }
}

interface SelectionState {
    [key: string]: {
        quantity: number;
        customAmount?: number;
    }
}

export function SupportDialog() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState<SelectionState>({});
  const [isProcessing, startProcessing] = useTransition();

  const totalAmount = useMemo(() => {
    return Object.entries(selection).reduce((total, [planId, data]) => {
      const plan = monetizationPlans.find(p => p.id === planId);
      if (!plan) return total;
      
      if (plan.type === 'custom_donation') {
          return total + (data.customAmount || 0);
      }
      return total + (plan.amount * data.quantity);
    }, 0);
  }, [selection]);
  
  const handleSelectionChange = (plan: Plan, type: 'toggle' | 'increment' | 'decrement') => {
      setSelection(prev => {
          const newSelection = { ...prev };
          const currentData = newSelection[plan.id] || { quantity: 0, customAmount: plan.amount };
          
          if (type === 'toggle') {
              if (currentData.quantity > 0) {
                  delete newSelection[plan.id];
              } else {
                  newSelection[plan.id] = { quantity: 1, customAmount: plan.amount };
              }
          } else if (type === 'increment') {
              newSelection[plan.id] = { ...currentData, quantity: currentData.quantity + 1 };
          } else if (type === 'decrement') {
              const newQuantity = Math.max(0, currentData.quantity - 1);
              if (newQuantity === 0) {
                  delete newSelection[plan.id];
              } else {
                  newSelection[plan.id] = { ...currentData, quantity: newQuantity };
              }
          }

          return newSelection;
      })
  }

  const handleCustomAmountChange = (planId: string, amount: number) => {
      setSelection(prev => {
          const newSelection = { ...prev };
          if (newSelection[planId]) {
              newSelection[planId] = { ...newSelection[planId], customAmount: amount };
          } else {
              // If user types in custom amount before ticking the box, select it.
              newSelection[planId] = { quantity: 1, customAmount: amount };
          }
          return newSelection;
      })
  }

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

  const handlePayment = () => {
     if (!user) {
         toast({ variant: 'destructive', title: 'Please log in to proceed.' });
         return;
     }
     if (totalAmount <= 0) {
         toast({ variant: 'destructive', title: 'Please select an amount to contribute.' });
         return;
     }

     startProcessing(async () => {
         try {
            toast({ title: 'Initiating secure payment...', description: 'Please wait.' });

            const transactionItems = Object.entries(selection).map(([planId, data]) => {
                const plan = monetizationPlans.find(p => p.id === planId)!;
                return {
                    id: plan.id,
                    name: plan.name,
                    quantity: data.quantity,
                    amount: plan.type === 'custom_donation' ? (data.customAmount || plan.amount) : plan.amount,
                };
            });
            
            const order = await createPaymentOrder({ items: transactionItems, currency: 'INR' });
            if (!order || !order.id) {
                throw new Error('Failed to create Razorpay order.');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Support Aaura',
                description: 'Contribution to Aaura Platform',
                order_id: order.id,
                handler: async (response: any) => {
                    const batch = writeBatch(db);
                    const transactionRef = doc(collection(db, 'transactions'));
                    batch.set(transactionRef, {
                        userId: user.uid,
                        items: transactionItems,
                        totalAmount: totalAmount,
                        status: 'completed',
                        createdAt: serverTimestamp(),
                        paymentGatewayId: response.razorpay_order_id,
                        paymentDetails: response,
                    });
                    await batch.commit();

                    toast({ title: 'Thank you for your support!', description: 'Your contribution is greatly appreciated.' });
                    setIsOpen(false);
                    setSelection({});
                },
                prefill: {
                    name: user.displayName || 'Aaura Supporter',
                    email: user.email,
                },
                theme: { color: '#E6E6FA' }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({ variant: 'destructive', title: 'Payment Failed', description: response.error.description });
            });
            rzp.open();

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
            {monetizationPlans.map((p) => {
                const currentSelection = selection[p.id];
                const isSelected = !!currentSelection;

                return (
                <Card 
                    key={p.id}
                    className={cn("transition-all", isSelected ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50")}
                >
                    <div className="flex items-start p-4">
                        <Checkbox 
                            id={p.id}
                            checked={isSelected}
                            onCheckedChange={() => handleSelectionChange(p, 'toggle')}
                            className="mr-4 mt-1"
                        />
                        <div className="flex-1">
                            <Label htmlFor={p.id} className="cursor-pointer">
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.description}</p>
                            </Label>
                        </div>
                         <div className="text-right">
                            <p className="font-bold">₹{p.amount}</p>
                            {p.period === 'year' && <p className="text-xs text-muted-foreground">per year</p>}
                        </div>
                    </div>
                    {isSelected && (p.type === 'donation') && (
                        <CardContent className="pt-0 pl-12">
                             <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${p.id}`} className="text-sm">Quantity:</Label>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleSelectionChange(p, 'decrement')}><Minus className="h-4 w-4"/></Button>
                                <span className="font-bold w-8 text-center">{currentSelection.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleSelectionChange(p, 'increment')}><Plus className="h-4 w-4"/></Button>
                            </div>
                        </CardContent>
                    )}
                    {isSelected && p.type === 'custom_donation' && (
                        <CardContent className="pt-0 pl-12">
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`amount-${p.id}`} className="text-sm">Amount (₹):</Label>
                                <Input
                                    id={`amount-${p.id}`}
                                    type="number"
                                    value={currentSelection.customAmount}
                                    onChange={(e) => handleCustomAmountChange(p.id, Number(e.target.value))}
                                    className="h-8 w-24"
                                    min={1}
                                />
                            </div>
                        </CardContent>
                    )}
                </Card>
            )})}
        </div>
        
        {totalAmount > 0 && (
            <>
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Contribution</span>
                <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            </>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing || totalAmount === 0}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
            Contribute ₹{totalAmount.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
