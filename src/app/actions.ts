
'use server';

import { generatePersonalizedHoroscope, type PersonalizedHoroscopeInput, type PersonalizedHoroscopeOutput } from '@/ai/flows/personalized-horoscope';
import { zodiacSigns } from '@/lib/zodiac';
import { z } from 'zod';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  birthDate: z.coerce.date({ required_error: 'A date of birth is required.' }),
  zodiacSign: z.enum(zodiacSigns, { required_error: 'Please select a zodiac sign.' }),
});

export type HoroscopeState = {
  message?: string;
  horoscope?: PersonalizedHoroscopeOutput;
  success: boolean;
};

export async function getHoroscope(
  formData: FormData
): Promise<HoroscopeState> {
  const rawFormData = {
    name: formData.get('name'),
    birthDate: formData.get('birthDate'),
    zodiacSign: formData.get('zodiacSign'),
  };
  
  const validatedFields = FormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
    return {
      message: `Invalid form data. ${errorMessages}`,
      success: false,
    };
  }

  const { birthDate, zodiacSign } = validatedFields.data;

  try {
    const horoscopeInput: PersonalizedHoroscopeInput = {
      zodiacSign,
      birthDate: birthDate.toISOString().split('T')[0], // format as YYYY-MM-DD
    };

    const result = await generatePersonalizedHoroscope(horoscopeInput);

    return {
      success: true,
      horoscope: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate horoscope. Please try again later.',
      success: false,
    };
  }
}
