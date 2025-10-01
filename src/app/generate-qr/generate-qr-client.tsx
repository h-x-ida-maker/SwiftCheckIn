
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Ticket, ExternalLink, AlertCircle } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import Link from "next/link";

export function GenerateQrClient({ event }: { event: EventDetails }) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setQrCodeUrl(null);

    if (!ticketNumber) {
      setError("Please enter a ticket number.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/qrcode/generate?eventNumber=${event.id}&ticketNumber=${ticketNumber}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code.");
      }

      setQrCodeUrl(data.qrCodeUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              Generate Ticket QR Code
            </CardTitle>
            <CardDescription>
              Enter a ticket number to generate a unique QR code for event check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketNumber">Ticket Number</Label>
              <Input
                id="ticketNumber"
                name="ticketNumber"
                type="number"
                placeholder="e.g., 123"
                required
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                min="1"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Generate QR Code"}
              {!isLoading && <QrCode className="ml-2 w-4 h-4" />}
            </Button>
          </CardFooter>
        </form>
        {qrCodeUrl && (
          <CardContent>
            <div className="mt-4 p-4 bg-accent/20 rounded-lg text-center">
                <h3 className="font-semibold text-lg">QR Code Ready!</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">
                    Your QR code has been generated successfully.
                </p>
                <Button asChild>
                    <Link href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                        View Ticket
                        <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
