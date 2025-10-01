export type EventDetails = {
  id: number;
  name: string;
  date: string;
  totalSeats: number;
};

export type CheckIn = {
  id: number;
  eventId: number;
  ticketNumber: number;
  userName: string;
  checkInTime: string;
};
