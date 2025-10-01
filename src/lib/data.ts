import type { EventDetails, CheckIn } from "./types";

// This is a simple in-memory store.
// In a real application, you would use a database.

interface Db {
  event: EventDetails | null;
  checkIns: CheckIn[];
}

const db: Db = {
  event: {
    id: 1,
    name: "Tech Conference 2024",
    date: "2024-10-26T09:00:00Z",
    totalSeats: 500,
  },
  checkIns: [
    { id: 1, eventId: 1, ticketNumber: 101, userName: "Alice Johnson", checkInTime: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, eventId: 1, ticketNumber: 204, userName: "Bob Williams", checkInTime: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
    { id: 3, eventId: 1, ticketNumber: 152, userName: "Charlie Brown", checkInTime: new Date(Date.now() - 1000 * 60 * 1).toISOString() },
  ],
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

export const setEvent = async (eventData: any): Promise<EventDetails | null> => {
  // Basic validation
  if (eventData && typeof eventData.number === 'number' && typeof eventData.details === 'string' && typeof eventData.date === 'string' && typeof eventData.seats === 'number') {
    const newEvent: EventDetails = {
      id: eventData.number,
      name: eventData.details,
      date: eventData.date,
      totalSeats: eventData.seats,
    };
    db.event = newEvent;
    // Reset checkins when a new event is imported
    db.checkIns = []; 
    return newEvent;
  }
  return null;
};

export const isTicketCheckedIn = async (eventId: number, ticketNumber: number): Promise<boolean> => {
    return db.checkIns.some(c => c.eventId === eventId && c.ticketNumber === ticketNumber);
}
