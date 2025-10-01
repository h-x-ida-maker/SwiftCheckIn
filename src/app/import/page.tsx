"use client";

import { useFormState, useFormStatus } from "react-dom";
import { importEventFromUrl } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Importing..." : "Import Event"}
    </Button>
  );
}

export default function ImportPage() {
  const initialState = { message: null };
  const [state, dispatch] = useFormState(importEventFromUrl, initialState);

  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-md">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Import Event from JSON
            </CardTitle>
            <CardDescription>
              Provide a direct link to a JSON file with event details. The file should contain keys: "number", "details", "date", and "seats".
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
              />
            </div>
            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
