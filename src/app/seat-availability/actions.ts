
'use server';

import { z } from 'zod';
import { suggestSeatAvailability } from '@/ai/flows/suggest-seat-availability';
import { getEvent, getCheckIns } from '@/lib/data';
import { format } from 'date-fns';

const FormSchema = z.object({
  historicalNoShowRate: z.coerce.number().min(0).max(100),
  attendanceNotes: z.string().optional(),
});

export type State = {
  message?: string | null;
  data?: {
    seatsPotentiallyAvailable: number;
    flagRecordsForReview: boolean;
    reasoning: string;
  } | null;
  errors?: {
    historicalNoShowRate?: string[];
    attendanceNotes?: string[];
  } | null;
};

export async function getSeatSuggestion(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    historicalNoShowRate: formData.get('historicalNoShowRate'),
    attendanceNotes: formData.get('attendanceNotes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Please check the fields.',
    };
  }
  
  const event = await getEvent();
  const checkIns = await getCheckIns();

  if (!event) {
    return { message: "No active event found." };
  }

  try {
    const input = {
        eventName: event.name,
        totalSeats: event.totalSeats,
        checkedInCount: checkIns.length,
        historicalNoShowRate: validatedFields.data.historicalNoShowRate / 100, // Convert percentage to decimal
        currentTime: format(new Date(), 'p'),
        eventStartTime: format(new Date(event.date), 'p'),
        attendanceNotes: validatedFields.data.attendanceNotes,
    };

    const result = await suggestSeatAvailability(input);

    return {
        message: 'Suggestion generated successfully.',
        data: result,
    };
  } catch (error) {
    console.error(error);
    return { message: 'Failed to get suggestion from AI.' };
  }
}
