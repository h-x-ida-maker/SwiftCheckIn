
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Ticket, Calendar, Users, CheckCircle, LayoutDashboard } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { z } from "zod";
import { setEvent } from "@/lib/data";
import { fetchEventData } from "@/lib/actions";

const EventSchema = z.object({
  meetup: z.object({
    meetupNumber: z.string(),
    title: z.string(),
    startDate: z.string().datetime(),
    amountOfParticipants: z.number(),
    amountOfAvailableSeats: z.number(),
  })
});

function ImportedEventCard({ event }: { event: EventDetails }) {
    return (
        <Card className="mt-6 border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-accent" />
                    Event Imported Successfully!
                </CardTitle>
                <CardDescription>
                    The following event has been loaded into the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{event.name}</p>
                        <p className="text-sm text-muted-foreground">Event Name</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{format(new Date(event.date), "PPP p")}</p>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{event.totalSeats.toLocaleString()} seats</p>
                        <p className="text-sm text-muted-foreground">Total Capacity</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Go to Dashboard
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedEvent, setImportedEvent] = useState<EventDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setImportedEvent(null);

    if (!url) {
      setError("Please enter a URL.");
      setIsLoading(false);
      return;
    }

    try {
      // Use the server action to fetch data
      const result = await fetchEventData(url);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data from the URL.");
      }
      
      const data = result.data;

      const parsedEvent = EventSchema.safeParse(data);
      if (!parsedEvent.success) {
        console.error("JSON data format error:", parsedEvent.error);
        throw new Error("The JSON data does not match the required format.");
      }

      const { meetup } = parsedEvent.data;
      
      const newEvent = setEvent({
        id: parseInt(meetup.meetupNumber, 10),
        name: meetup.title,
        date: meetup.startDate,
        totalSeats: meetup.amountOfParticipants + meetup.amountOfAvailableSeats,
      });

      // Dispatch a storage event to notify other tabs/windows
      window.dispatchEvent(new Event("storage"));
      
      setImportedEvent(newEvent);
      setUrl(""); // Clear input on success

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10">
        <div className="w-full max-w-md">
            <Card>
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    Import Event from URL
                    </CardTitle>
                    <CardDescription>
                    Provide a direct URL to a JSON file. The existing event and check-in data will be replaced.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="url">Event URL</Label>
                    <Input
                        id="url"
                        name="url"
                        type="url"
                        placeholder="https://example.com/event.json"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Importing..." : "Import Event"}
                    </Button>
                </CardFooter>
                </form>
            </Card>
            {importedEvent && <ImportedEventCard event={importedEvent} />}
        </div>
    </div>
  );
}
