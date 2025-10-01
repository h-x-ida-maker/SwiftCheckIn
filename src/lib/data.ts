import type { EventDetails, CheckIn } from "./types";

const EVENT_KEY = "swiftcheck_event";
const CHECKINS_KEY = "swiftcheck_checkins";

// --- Helper Functions ---

function isClientSide(): boolean {
  return typeof window !== "undefined";
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isClientSide()) {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

function setInStorage<T>(key: string, value: T): void {
  if (!isClientSide()) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

// --- Data Access Functions ---

export const getEvent = (): EventDetails | null => {
  return getFromStorage<EventDetails | null>(EVENT_KEY, null);
};

export const getCheckIns = (): CheckIn[] => {
  const checkIns = getFromStorage<CheckIn[]>(CHECKINS_KEY, []);
  // Return a sorted copy
  return checkIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
};

export const addCheckIn = (checkIn: Omit<CheckIn, "id">): CheckIn => {
  const checkIns = getCheckIns();
  const newId = checkIns.length > 0 ? Math.max(...checkIns.map(c => c.id)) + 1 : 1;
  const newCheckIn = { ...checkIn, id: newId };
  setInStorage(CHECKINS_KEY, [...checkIns, newCheckIn]);
  return newCheckIn;
};

export const setEvent = (eventData: EventDetails): EventDetails => {
  setInStorage(EVENT_KEY, eventData);
  // Reset check-ins when a new event is set
  setInStorage(CHECKINS_KEY, []);
  return eventData;
};

export const isTicketCheckedIn = (eventId: number, ticketNumber: number): boolean => {
  const checkIns = getCheckIns();
  return checkIns.some(c => c.eventId === eventId && c.ticketNumber === ticketNumber);
};

export const clearData = (): void => {
    if (!isClientSide()) return;
    window.localStorage.removeItem(EVENT_KEY);
    window.localStorage.removeItem(CHECKINS_KEY);
}
