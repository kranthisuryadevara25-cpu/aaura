'use server';

/**
 * @fileOverview Generates a personalized horoscope based on user zodiac sign and birth details.
 *
 * - generatePersonalizedHoroscope - A function that generates a personalized horoscope.
 * - PersonalizedHoroscopeInput - The input type for the generatePersonalizedHoroscope function.
 * - PersonalizedHoroscopeOutput - The return type for the generatePersonalizedHoroscope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHoroscopeInputSchema = z.object({
  zodiacSign: z.string().describe('The zodiac sign of the user.'),
  birthDate: z.string().describe('The birth date of the user (YYYY-MM-DD).'),
  timeZone: z.string().optional().describe('The time zone of the user (e.g., America/Los_Angeles).'),
});
export type PersonalizedHoroscopeInput = z.infer<typeof PersonalizedHoroscopeInputSchema>;

const PersonalizedHoroscopeOutputSchema = z.object({
  horoscope: z.string().describe('The generated personalized horoscope.'),
  disclaimer: z.string().describe('A disclaimer for entertainment purposes only.'),
});
export type PersonalizedHoroscopeOutput = z.infer<typeof PersonalizedHoroscopeOutputSchema>;

export async function generatePersonalizedHoroscope(input: PersonalizedHoroscopeInput): Promise<PersonalizedHoroscopeOutput> {
  return personalizedHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHoroscopePrompt',
  input: {schema: PersonalizedHoroscopeInputSchema},
  output: {schema: PersonalizedHoroscopeOutputSchema},
  prompt: `You are a personal horoscope generator. Your job is to generate a personalized horoscope for the user, based on their zodiac sign and birth date.

  Zodiac Sign: {{{zodiacSign}}}
  Birth Date: {{{birthDate}}}
  Time Zone: {{{timeZone}}}

  Make sure the horoscope is positive and uplifting. Include a disclaimer that it is for entertainment purposes only.

  Output:
  {{
    "horoscope": "<generated horoscope>",
    "disclaimer": "This horoscope is for entertainment purposes only."
  }}
  `,
});

const personalizedHoroscopeFlow = ai.defineFlow(
  {
    name: 'personalizedHoroscopeFlow',
    inputSchema: PersonalizedHoroscopeInputSchema,
    outputSchema: PersonalizedHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
