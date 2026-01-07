
import { validateQrCode } from "@/lib/actions";
import { getEvent, addCheckIn, isTicketCheckedIn } from "@/lib/data";

export type ProcessScanResult = {
    success: boolean;
    message: string;
    ticketNumber?: number;
};

/**
 * Common business logic for processing a decoded QR code string.
 * Used by both live camera scanner and file upload scanner.
 */
export async function processDecodedText(decodedText: string): Promise<ProcessScanResult> {
    const currentEvent = getEvent();
    if (!currentEvent) {
        return { success: false, message: "No event loaded. Please import an event first." };
    }

    const validationResult = await validateQrCode(decodedText, currentEvent.id);

    if (!validationResult.success || validationResult.ticketNumber === null) {
        return { success: false, message: validationResult.message };
    }

    const { ticketNumber } = validationResult;

    if (isTicketCheckedIn(currentEvent.id, ticketNumber)) {
        return {
            success: false,
            message: `Ticket #${ticketNumber} has already been checked in.`,
            ticketNumber
        };
    }

    addCheckIn({
        eventId: currentEvent.id,
        ticketNumber: ticketNumber,
        userName: `User #${ticketNumber}`,
        checkInTime: new Date().toISOString(),
    });

    // Notify other components (like dashboard)
    window.dispatchEvent(new Event("storage"));

    return {
        success: true,
        message: `Ticket #${ticketNumber} checked in successfully!`,
        ticketNumber
    };
}
