
import { unstable_cache as cache } from "next/cache";
import type { EventDetails, CheckIn } from "./types";

// In a real application, you would use a database.
// We are using the Next.js cache to simulate a persistent store for this demo.

const getDb = cache(
  async () => {
    return {
      event: null as EventDetails | null,
      checkIns: [] as CheckIn[],
    };
  },
  ["swiftcheck-db"],
  { tags: ["event", "checkIns"] }
);


export const getEvent = async (): Promise<EventDetails | null> => {
  const db = await getDb();
  return db.event;
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  const db = await getDb();
  return db.checkIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
};

export const addCheckIn = async (checkIn: Omit<CheckIn, "id">): Promise<CheckIn> => {
  const db = await getDb();
  const newId = db.checkIns.length > 0 ? Math.max(...db.checkIns.map(c => c.id)) + 1 : 1;
  const newCheckIn = { ...checkIn, id: newId };
  db.checkIns.push(newCheckIn);
  return newCheckIn;
};

export const setEvent = async (eventData: EventDetails): Promise<EventDetails> => {
    const db = await getDb();
    db.event = eventData;
    // Reset checkins when a new event is imported
    db.checkIns = []; 
    return db.event;
};

export const isTicketCheckedIn = async (eventId: number, ticketNumber: number): Promise<boolean> => {
    const db = await getDb();
    return db.checkIns.some(c => c.eventId === eventId && c.ticketNumber === ticketNumber);
}
