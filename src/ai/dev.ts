'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-horoscope.ts';
import '@/ai/ai-video-recommendations.ts';
import '@/ai/flows/deity-daily-relevance.ts';
import '@/ai/flows/personalized-feed.ts';
import '@/ai/flows/create-razorpay-order.ts';
import '@/ai/ai-content-moderation.ts';

