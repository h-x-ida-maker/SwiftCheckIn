
"use server";

import { z } from "zod";
import { setEvent, addCheckIn, getEvent, isTicketCheckedIn } from "@/lib/data";
import { revalidateTag } from "next/cache";
import type { EventDetails } from "./types";
import crypto from "crypto";

const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY || "super-secret-key-for-swiftcheck-demo";

const ImportEventSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

// Updated schema to match the provided JSON structure
const EventSchema = z.object({
    meetup: z.object({
        meetupNumber: z.string(),
        title: z.string(),
        startDate: z.string().datetime(),
        amountOfParticipants: z.number(),
        amountOfAvailableSeats: z.number(),
    })
});

type ImportState = {
    message: string | null;
    event: EventDetails | null;
}

export async function importEventFromUrl(prevState: ImportState, formData: FormData): Promise<ImportState> {
  const validatedFields = ImportEventSchema.safeParse({
    url: formData.get("url"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid URL provided.",
      event: null,
    };
  }

  try {
    const response = await fetch(validatedFields.data.url);
    if (!response.ok) {
      return { message: "Failed to fetch data from the URL.", event: null };
    }
    const data = await response.json();

    const parsedEvent = EventSchema.safeParse(data);
    if (!parsedEvent.success) {
        console.error("JSON data format error:", parsedEvent.error);
        return { message: "The JSON data does not match the required format.", event: null };
    }

    const { meetup } = parsedEvent.data;
    
    const newEvent = await setEvent({
      id: parseInt(meetup.meetupNumber, 10),
      name: meetup.title,
      date: meetup.startDate,
      totalSeats: meetup.amountOfParticipants + meetup.amountOfAvailableSeats,
    });
    
    // Revalidate the 'database' tag to ensure all pages get fresh data
    revalidateTag("database");

    return { message: "Event imported successfully!", event: newEvent };

  } catch (error) {
    console.error(error);
    return { message: "An error occurred while importing the event.", event: null };
  }
}


// QR code validation and check-in
const QR_DATA_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function validateAndCheckIn(qrData: string) {
    try {
        const [eventNumber, ticketNumber, timestamp, receivedHmac] = qrData.split(':');
        
        if (!eventNumber || !ticketNumber || !timestamp || !receivedHmac) {
            return { success: false, message: "Invalid QR code format." };
        }
        
        const currentEvent = await getEvent();
        if (!currentEvent || currentEvent.id.toString() !== eventNumber) {
            return { success: false, message: "QR code is for a different event." };
        }

        const dataToVerify = `${eventNumber}:${ticketNumber}:${timestamp}`;
        const generatedHmac = crypto.createHmac('sha256', HMAC_SECRET_KEY).update(dataToVerify).digest('hex');

        if (generatedHmac !== receivedHmac) {
            return { success: false, message: "Invalid ticket. Signature mismatch." };
        }

        const qrTimestamp = parseInt(timestamp, 10);
        if (Date.now() - qrTimestamp > QR_DATA_TTL_MS) {
            return { success: false, message: "QR code has expired. Please regenerate." };
        }

        const eventIdNum = parseInt(eventNumber, 10);
        const ticketNumberNum = parseInt(ticketNumber, 10);

        const alreadyCheckedIn = await isTicketCheckedIn(eventIdNum, ticketNumberNum);
        if (alreadyCheckedIn) {
            return { success: false, message: `Ticket #${ticketNumberNum} has already been checked in.` };
        }

        await addCheckIn({
            eventId: eventIdNum,
            ticketNumber: ticketNumberNum,
            userName: `User #${ticketNumberNum}`, // Placeholder user name
            checkInTime: new Date().toISOString(),
        });

        revalidateTag('database');
        return { success: true, message: `Ticket #${ticketNumberNum} checked in successfully!` };

    } catch (error) {
        console.error("Check-in error:", error);
        return { success: false, message: "An unexpected error occurred during check-in." };
    }
}
