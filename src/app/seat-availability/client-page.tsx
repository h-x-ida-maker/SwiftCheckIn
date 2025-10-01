
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getSeatSuggestion, type State } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Lightbulb, AlertCircle, Flag, Users } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Analyzing..." : "Get Suggestion"}
      {!pending && <Wand2 className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export function SeatAvailabilityClient({ event, checkedInCount }: { event: EventDetails, checkedInCount: number }) {
  const initialState: State = { message: null, data: null, errors: null };
  const [state, dispatch] = useFormState(getSeatSuggestion, initialState);
  const [sliderValue, setSliderValue] = useState([10]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Seat Availability Tool
            </CardTitle>
            <CardDescription>
              Use AI to predict seat availability based on current check-ins and historical data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="historicalNoShowRate">Historical No-Show Rate</Label>
                <span className="text-sm font-medium text-primary">{sliderValue[0]}%</span>
              </div>
              <Slider
                id="historicalNoShowRate"
                name="historicalNoShowRate"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                onValueChange={setSliderValue}
              />
              {state.errors?.historicalNoShowRate && <p className="text-sm text-destructive">{state.errors.historicalNoShowRate[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendanceNotes">Attendance Notes (Optional)</Label>
              <Textarea
                id="attendanceNotes"
                name="attendanceNotes"
                placeholder="e.g., Heavy traffic reported, slow entry, etc."
                rows={4}
              />
              {state.errors?.attendanceNotes && <p className="text-sm text-destructive">{state.errors.attendanceNotes[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <div className="space-y-4">
        {state.message && !state.data && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <CardTitle className="text-lg text-destructive">Analysis Failed</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{state.message}</p>
                </CardContent>
            </Card>
        )}

        {state.data ? (
            <Card className="bg-accent/10 border-accent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Lightbulb className="w-6 h-6 text-accent-foreground" />
                        AI Suggestion
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Potentially Available Seats</p>
                            <p className="text-3xl font-bold">{state.data.seatsPotentiallyAvailable}</p>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Flag Records for Review</p>
                            <Badge variant={state.data.flagRecordsForReview ? 'destructive' : 'default'} className="text-lg mt-1">
                                {state.data.flagRecordsForReview ? "Yes" : "No"}
                            </Badge>
                        </div>
                         <Flag className={`w-8 h-8 ${state.data.flagRecordsForReview ? 'text-destructive' : 'text-muted-foreground'}`}/>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Reasoning</h4>
                        <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md border">{state.data.reasoning}</p>
                    </div>
                </CardContent>
            </Card>
        ) : (
             <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed h-full">
                <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Awaiting Analysis</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                    Fill out the form and run the analysis to see AI-powered suggestions here.
                </p>
            </Card>
        )}
      </div>
    </div>
  );
}
