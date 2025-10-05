
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
  },
  async (input) => {
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured in the environment.");
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: {
        productId: input.productId,
      }
    };
    
    try {
      const order = await instance.orders.create(options);
      // TODO: Here, you should also create an 'order' document in your Firestore
      // `orders` collection with a status of 'created'. This document would
      // be updated later via webhooks from Razorpay.

      return order;

    } catch (error: any) {
      console.error("Razorpay order creation failed:", error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }
);
