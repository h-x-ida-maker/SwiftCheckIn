import type { EventDetails, CheckIn } from "./types";

// This is a simple in-memory store.
// In a real application, you would use a database.

interface Db {
  event: EventDetails | null;
  checkIns: CheckIn[];
}

const db: Db = {
  event: null,
  checkIns: [],
};

// Functions to interact with the in-memory store
export const getEvent = async (): Promise<EventDetails | null> => {
  return db.event;
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return db.checkIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
};

export const addCheckIn = async (checkIn: Omit<CheckIn, "id">): Promise<CheckIn> => {
  const newId = db.checkIns.length > 0 ? Math.max(...db.checkIns.map(c => c.id)) + 1 : 1;
  const newCheckIn = { ...checkIn, id: newId };
  db.checkIns.push(newCheckIn);
  return newCheckIn;
};

export const setEvent = async (eventData: EventDetails): Promise<EventDetails> => {
    db.event = eventData;
    // Reset checkins when a new event is imported
    db.checkIns = []; 
    return db.event;
};

export const isTicketCheckedIn = async (eventId: number, ticketNumber: number): Promise<boolean> => {
    return db.checkIns.some(c => c.eventId === eventId && c.ticketNumber === ticketNumber);
}
