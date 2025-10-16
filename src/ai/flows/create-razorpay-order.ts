
'use server';

/**
 * @fileOverview A server-side flow to securely create a Razorpay order.
 * 
 * - createRazorpayOrder - Creates an order on Razorpay and returns the order details.
 * - CreateRazorpayOrderInput - Input schema for the flow.
 * - CreateRazorpayOrderOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';

// ---------------------------------------------------
// 1. Input/Output Schema Definition
// ---------------------------------------------------
const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

const CreateRazorpayOrderInputSchema = z.object({
  cartItems: z.array(CartItemSchema).min(1, "Cart cannot be empty."),
  currency: z.string().default('INR'),
});
export type CreateRazorpayOrderInput = z.infer<typeof CreateRazorpayOrderInputSchema>;


// The output schema should match the structure of the Razorpay order object
const CreateRazorpayOrderOutputSchema = z.object({
    id: z.string(),
    entity: z.string(),
    amount: z.number(),
    amount_paid: z.number(),
    amount_due: z.number(),
    currency: z.string(),
    receipt: z.string().nullable(),
    offer_id: z.string().nullable(),
    status: z.string(),
    attempts: z.number(),
    notes: z.any(),
    created_at: z.number()
});
export type CreateRazorpayOrderOutput = z.infer<typeof CreateRazorpayOrderOutputSchema>;


// ---------------------------------------------------
// 2. Exported "Callable" Function
// ---------------------------------------------------

export async function createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<CreateRazorpayOrderOutput> {
  return createRazorpayOrderFlow(input);
}


// ---------------------------------------------------
// 3. The Genkit Flow Implementation
// ---------------------------------------------------

const createRazorpayOrderFlow = ai.defineFlow(
  {
    name: 'createRazorpayOrderFlow',
    inputSchema: CreateRazorpayOrderInputSchema,
    outputSchema: CreateRazorpayOrderOutputSchema,
    authPolicy: (auth, input) => {
        if (!auth) {
          throw new Error("User must be authenticated to create an order.");
        }
    }
  },
  async (input) => {
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured in the environment.");
    }
    
    // --- Server-side price calculation ---
    const productIds = input.cartItems.map(item => item.productId);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('__name__', 'in', productIds));
    const productSnapshots = await getDocs(q);

    const productPriceMap = new Map<string, number>();
    productSnapshots.forEach(doc => {
      productPriceMap.set(doc.id, doc.data().price);
    });

    let serverCalculatedTotal = 0;
    for (const item of input.cartItems) {
      const price = productPriceMap.get(item.productId);
      if (price === undefined) {
        throw new Error(`Product with ID ${item.productId} not found or price is missing.`);
      }
      serverCalculatedTotal += price * item.quantity;
    }
    // --- End server-side price calculation ---

    const serverPriceInPaise = Math.round(serverCalculatedTotal * 100);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const receiptId = `receipt_cart_${new Date().getTime()}`;

    const options = {
      amount: serverPriceInPaise,
      currency: input.currency,
      receipt: receiptId,
    };
    
    try {
      const order = await instance.orders.create(options);
      // In a real app, you would create an 'order' document in Firestore
      // with a 'created' status here. This document would be updated
      // later by a webhook from Razorpay upon payment success/failure.

      return order;

    } catch (error: any) {
      console.error("Razorpay order creation failed:", error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }
);
