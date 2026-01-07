"use client";

import { useState, useEffect } from "react";
import { getEvent } from "@/lib/data";
import { GenerateQrClient } from "./generate-qr-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ticket } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import { useIsClient } from "@/hooks/use-is-client";

export default function GenerateQrPage() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      setEvent(getEvent());
    }
  }, [isClient]);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-sm mx-auto animate-in fade-in duration-700">
        <div className="p-6 rounded-3xl bg-primary/5 mb-6 ring-1 ring-primary/10">
          <Ticket className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold font-headline tracking-tight mb-2">No Event Found</h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          You need an active event to generate tickets. Please import your event data first.
        </p>
        <Button asChild size="lg" className="mt-8 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
          <Link href="/import">Import Event Now</Link>
        </Button>
      </div>
    );
  }

  return <GenerateQrClient event={event} />;
}
