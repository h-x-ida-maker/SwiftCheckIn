'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest seat availability based on check-in data.
 *
 * - suggestSeatAvailability - A function that triggers the seat availability suggestion flow.
 * - SuggestSeatAvailabilityInput - The input type for the suggestSeatAvailability function.
 * - SuggestSeatAvailabilityOutput - The return type for the suggestSeatAvailability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSeatAvailabilityInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  totalSeats: z.number().describe('The total number of seats available for the event.'),
  checkedInCount: z.number().describe('The current number of attendees checked in.'),
  historicalNoShowRate: z
    .number()
    .describe(
      'The historical no-show rate for similar events (as a decimal, e.g., 0.1 for 10%).'
    ),
  currentTime: z.string().describe('The current time (e.g., 2:30 PM).'),
  eventStartTime: z.string().describe('The scheduled start time of the event (e.g., 3:00 PM).'),
  attendanceNotes: z
    .string()
    .optional()
    .describe('Optional notes about attendance trends or specific attendee behavior.'),
});
export type SuggestSeatAvailabilityInput = z.infer<typeof SuggestSeatAvailabilityInputSchema>;

const SuggestSeatAvailabilityOutputSchema = z.object({
  seatsPotentiallyAvailable: z
    .number()
    .describe(
      'The estimated number of seats that might become available due to no-shows or early departures.'
    ),
  flagRecordsForReview: z
    .boolean()
    .describe(
      'A boolean indicating whether certain attendee records should be flagged for review and potential action.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning behind the seat availability suggestion and the decision to flag records for review.'
    ),
});
export type SuggestSeatAvailabilityOutput = z.infer<typeof SuggestSeatAvailabilityOutputSchema>;

export async function suggestSeatAvailability(
  input: SuggestSeatAvailabilityInput
): Promise<SuggestSeatAvailabilityOutput> {
  return suggestSeatAvailabilityFlow(input);
}

const suggestSeatAvailabilityPrompt = ai.definePrompt({
  name: 'suggestSeatAvailabilityPrompt',
  input: {schema: SuggestSeatAvailabilityInputSchema},
  output: {schema: SuggestSeatAvailabilityOutputSchema},
  prompt: `You are an AI assistant that analyzes event check-in data to predict potential seat availability.

  Based on the following information, estimate how many seats might become available and whether certain attendee records should be flagged for review.

  Event Name: {{{eventName}}}
  Total Seats: {{{totalSeats}}}
  Checked-In Count: {{{checkedInCount}}}
  Historical No-Show Rate: {{{historicalNoShowRate}}}
  Current Time: {{{currentTime}}}
  Event Start Time: {{{eventStartTime}}}
  Attendance Notes: {{{attendanceNotes}}}

  Consider factors like the historical no-show rate, the time elapsed since the event started, and any additional attendance notes.

  Reasoning should outline the factors considered and their impact on the seat availability suggestion and flag decision.
  seatsPotentiallyAvailable should be a number between 0 and the total number of seats.
`,
});

const suggestSeatAvailabilityFlow = ai.defineFlow(
  {
    name: 'suggestSeatAvailabilityFlow',
    inputSchema: SuggestSeatAvailabilityInputSchema,
    outputSchema: SuggestSeatAvailabilityOutputSchema,
  },
  async input => {
    const {output} = await suggestSeatAvailabilityPrompt(input);
    return output!;
  }
);
