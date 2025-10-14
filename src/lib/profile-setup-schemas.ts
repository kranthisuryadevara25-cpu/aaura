
import * as z from 'zod';

export const step1Schema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  birthDate: z.date({ required_error: 'Please select your birth date.' }),
  timeOfBirth: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format.'),
  placeOfBirth: z.string().min(1, 'Place of birth is required.'),
});

export const step2Schema = z.object({
  favoriteDeities: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one deity.',
  }),
});

export const formSchema = step1Schema.merge(step2Schema);
