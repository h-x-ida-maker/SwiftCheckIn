
import { getEvent } from "@/lib/data";
import { GenerateQrClient } from "./generate-qr-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default async function GenerateQrPage() {
  const event = await getEvent();

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card p-8 rounded-lg border">
        <Ticket className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Event Loaded</h2>
        <p className="text-muted-foreground mt-2">
          Import an event to generate tickets.
        </p>
        <Button asChild className="mt-6">
          <Link href="/import">Import Event</Link>
        </Button>
      </div>
    );
  }

  return <GenerateQrClient event={event} />;
}
