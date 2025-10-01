
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { importEventFromUrl } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Ticket, Calendar, Users, CheckCircle } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import { format } from "date-fns";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Importing..." : "Import Event"}
    </Button>
  );
}

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
        </Card>
    );
}


export default function ImportPage() {
  const initialState = { message: null, event: null };
  const [state, dispatch] = useActionState(importEventFromUrl, initialState);

  return (
    <div className="flex justify-center items-start pt-10">
        <div className="w-full max-w-md">
            <Card>
                <form action={dispatch}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    Import Event from JSON
                    </CardTitle>
                    <CardDescription>
                    Provide a direct link to a JSON file with event details. The existing event and check-in data will be replaced.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="url">JSON URL</Label>
                    <Input
                        id="url"
                        name="url"
                        type="url"
                        placeholder="https://example.com/event.json"
                        required
                        key={state?.event?.id} // Reset input on successful import
                    />
                    </div>
                    {state?.message && !state.event && (
                    <p className="text-sm text-destructive">{state.message}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
                </form>
            </Card>
            {state.event && <ImportedEventCard event={state.event} />}
        </div>
    </div>
  );
}

