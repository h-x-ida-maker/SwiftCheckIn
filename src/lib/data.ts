
import { unstable_cache as cache } from "next/cache";
import type { EventDetails, CheckIn } from "./types";

// In a real application, you would use a database.
// For this demo, we'll use a cached object to simulate a persistent store.
// The key is to revalidate the cache tag whenever data changes.

const DB_TAG = "database";

const getDb = cache(
  async () => {
    console.log("Initializing or re-fetching DB cache");
    // The object returned by cache() is memoized. To simulate mutations,
    // we need to rely on revalidateTag to have this function re-run.
    // However, for a shared mutable state in a demo, a simple global
    // can be more illustrative of the problem space, but cache is Next.js idiomatic.
    // Let's create a structure that can be "mutated" and re-cached.
    if ((global as any)._db === undefined) {
      console.log("Creating new in-memory DB");
      (global as any)._db = {
        event: null as EventDetails | null,
        checkIns: [] as CheckIn[],
      };
    }
    return (global as any)._db;
  },
  ["swiftcheck-db"],
  { tags: [DB_TAG] }
);


export const getEvent = async (): Promise<EventDetails | null> => {
  const db = await getDb();
  return db.event;
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  const db = await getDb();
  // Return a sorted copy to avoid mutating the cached object directly
  return [...db.checkIns].sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
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
