
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
        <Card className="mt-8 border-accent/20 soft-shadow bg-accent/5 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 rounded-3xl">
            <div className="h-1 bg-accent" />
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-xl">
                    <div className="p-2 rounded-xl bg-accent/10">
                        <CheckCircle className="w-6 h-6 text-accent" />
                    </div>
                    Event Imported Successfully!
                </CardTitle>
                <CardDescription className="text-sm">
                    The following event has been loaded into your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-2xl bg-background border border-border/40 text-muted-foreground group-hover:text-primary transition-colors">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold font-headline">{event.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Event Name</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-2xl bg-background border border-border/40 text-muted-foreground group-hover:text-primary transition-colors">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold font-headline">{format(new Date(event.date), "PPP p")}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Date & Time</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-2xl bg-background border border-border/40 text-muted-foreground group-hover:text-primary transition-colors">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold font-headline">{event.totalSeats.toLocaleString()} seats</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Total Capacity</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-accent/5 pt-6 pb-6 border-t border-accent/10">
                <Button asChild className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-accent/20">
                    <Link href="/">
                        <LayoutDashboard className="mr-2 h-5 w-5" />
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

            window.dispatchEvent(new Event("storage"));

            setImportedEvent(newEvent);
            setUrl("");

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-2xl mx-auto animate-in fade-in duration-700">
            <div className="text-center mb-8 space-y-2">
                <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-gradient">Import Event</h1>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">Sync your event data seamlessly from a JSON source to get started.</p>
            </div>

            <Card className="border-border/40 soft-shadow p-2 bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border/50 rounded-3xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline tracking-tight">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Upload className="w-6 h-6" />
                            </div>
                            Data Source URL
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Provide a direct URL to a JSON file. Existing data will be replaced.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <div className="space-y-3">
                            <Label htmlFor="url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Source Endpoint</Label>
                            <Input
                                id="url"
                                name="url"
                                type="url"
                                placeholder="https://api.example.com/event.json"
                                required
                                className="h-12 rounded-xl bg-background/50 border-border/60 focus:ring-primary focus:border-primary transition-all duration-300"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : "Sync Event Data"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            {importedEvent && <ImportedEventCard event={importedEvent} />}
        </div>
    );
}
