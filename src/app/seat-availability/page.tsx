
import { getEvent, getCheckIns } from "@/lib/data";
import { SeatAvailabilityClient } from "./client-page";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import Link from "next/link";

export default async function SeatAvailabilityPage() {
  const event = await getEvent();
  const checkIns = await getCheckIns();

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card p-8 rounded-lg border">
        <Ticket className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Event Loaded</h2>
        <p className="text-muted-foreground mt-2">
          Import an event to use the seat availability tool.
        </p>
        <Button asChild className="mt-6">
          <Link href="/import">Import Event</Link>
        </Button>
      </div>
    );
  }

  return (
    <SeatAvailabilityClient event={event} checkedInCount={checkIns.length} />
  );
}
