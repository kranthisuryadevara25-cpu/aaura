// This is a server-side file
'use server';

/**
 * @fileOverview A content moderation AI agent.
 *
 * - moderateContent - A function that handles the content moderation process.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('The description of the video.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether or not the content is appropriate for the platform.'),
  reason: z.string().describe('The reason why the content is not appropriate, if applicable.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderator for a spiritual and wellness platform.

  Your task is to determine if the provided video content is appropriate for the platform.
  The platform only allows positive, religious, spiritual, and wellness content such as religious videos, yoga tutorials, meditation guides, devotional music, spiritual talks, and uplifting stories. No secular, negative, or non-spiritual content is allowed.

  Analyze the following information to determine if the content is appropriate:

  Title: {{{title}}}
  Description: {{{description}}}

  Based on your analysis, set the isAppropriate output field to true if the content is appropriate, and false otherwise. If the content is not appropriate, provide a reason in the reason output field.

  Respond in JSON format.
  `,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
