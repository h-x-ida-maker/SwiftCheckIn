
"use server";

import crypto from "crypto";

const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY || "super-secret-key-for-swiftcheck-demo";
const QR_DATA_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Server action to fetch event data from a URL.
 * This is needed to bypass browser CORS restrictions.
 */
export async function fetchEventData(url: string) {
    try {
        const response = await fetch(url, {
            // Revalidate every hour
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            return { success: false, message: `Failed to fetch data from the URL. Status: ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Fetch Event Data error:", error);
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
            return { success: false, message: "Network error or invalid URL. Please check the URL and your connection." };
        }
        return { success: false, message: "An unexpected error occurred while fetching the event data." };
    }
}


/**
 * This server action only *validates* the QR code. It does not perform the check-in itself,
 * as it does not have access to the client-side localStorage. The client will
 * call this, and if successful, will perform the check-in via `addCheckIn` from `lib/data.ts`.
 */
export async function validateQrCode(qrData: string, currentEventId: number) {
    try {
        const [eventNumber, ticketNumber, timestamp, receivedHmac] = qrData.split(':');
        
        if (!eventNumber || !ticketNumber || !timestamp || !receivedHmac) {
            return { success: false, message: "Invalid QR code format.", ticketNumber: null };
        }
        
        if (currentEventId.toString() !== eventNumber) {
            return { success: false, message: "QR code is for a different event.", ticketNumber: null };
        }

        const dataToVerify = `${eventNumber}:${ticketNumber}:${timestamp}`;
        const generatedHmac = crypto.createHmac('sha256', HMAC_SECRET_KEY).update(dataToVerify).digest('hex');

        if (generatedHmac !== receivedHmac) {
            return { success: false, message: "Invalid ticket. Signature mismatch.", ticketNumber: null };
        }

        const qrTimestamp = parseInt(timestamp, 10);
        if (Date.now() - qrTimestamp > QR_DATA_TTL_MS) {
            return { success: false, message: "QR code has expired. Please regenerate.", ticketNumber: null };
        }
        
        // Return success and ticket number, client will handle check-in
        return { success: true, message: `Ticket #${ticketNumber} is valid.`, ticketNumber: parseInt(ticketNumber, 10) };

    } catch (error) {
        console.error("QR Validation error:", error);
        return { success: false, message: "An unexpected error occurred during validation.", ticketNumber: null };
    }
}
