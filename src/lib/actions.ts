
"use server";

import { z } from "zod";
import { setEvent, addCheckIn, getEvent, isTicketCheckedIn } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";

const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY || "super-secret-key-for-swiftcheck-demo";

// Schema for event import
const ImportEventSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

const EventSchema = z.object({
    meetup: z.object({
        meetupNumber: z.string(),
        title: z.string(),
        startDate: z.string(),
        amountOfParticipants: z.number(),
        amountOfAvailableSeats: z.number(),
    })
});

export async function importEventFromUrl(prevState: any, formData: FormData) {
  const validatedFields = ImportEventSchema.safeParse({
    url: formData.get("url"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid URL provided.",
    };
  }

  try {
    const response = await fetch(validatedFields.data.url);
    if (!response.ok) {
      return { message: "Failed to fetch data from the URL." };
    }
    const data = await response.json();

    const parsedEvent = EventSchema.safeParse(data);
    if (!parsedEvent.success) {
        console.error("JSON data format error:", parsedEvent.error);
        return { message: "The JSON data does not match the required format." };
    }

    const { meetup } = parsedEvent.data;
    const eventToSet = {
        number: parseInt(meetup.meetupNumber, 10),
        details: meetup.title,
        date: meetup.startDate,
        seats: meetup.amountOfParticipants + meetup.amountOfAvailableSeats,
    };

    await setEvent(eventToSet);
  } catch (error) {
    console.error(error);
    return { message: "An error occurred while importing the event." };
  }

  revalidatePath("/");
  revalidatePath("/check-in-log");
  redirect("/");
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
            // Note: In a real-world scenario, avoid giving hints about why validation failed.
            // For this demo, we are more explicit.
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

        revalidatePath('/');
        revalidatePath('/check-in-log');
        return { success: true, message: `Ticket #${ticketNumberNum} checked in successfully!` };

    } catch (error) {
        console.error("Check-in error:", error);
        return { success: false, message: "An unexpected error occurred during check-in." };
    }
}
