
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';

// ---------------------------------------------------
// 1. Input/Output Schema Definition
// ---------------------------------------------------

const CreateRazorpayOrderInputSchema = z.object({
  amount: z.number().min(100, "Amount must be at least 100 paise (₹1)."), // Amount in smallest currency unit (e.g., paise)
  currency: z.string().default('INR'),
  receipt: z.string(),
  productId: z.string(),
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
    
    // Fetch product from Firestore to verify price on the server
    const productRef = doc(db, 'products', input.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        throw new Error("Product not found.");
    }
    const productData = productSnap.data();
    const serverPriceInPaise = productData.price * 100;

    // Security check: Verify the amount from the client matches the server's price
    if (input.amount !== serverPriceInPaise) {
        throw new Error(`Price mismatch. Client requested ${input.amount}, but server price is ${serverPriceInPaise}.`);
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: serverPriceInPaise, // Use the server-verified price
      currency: input.currency,
      receipt: input.receipt,
      notes: {
        productId: input.productId,
      }
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
