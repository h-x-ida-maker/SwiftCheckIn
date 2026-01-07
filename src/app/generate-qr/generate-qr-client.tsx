
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Ticket, ExternalLink, AlertCircle } from "lucide-react";
import type { EventDetails } from "@/lib/types";
import Link from "next/link";
import crypto from "crypto";

const HMAC_SECRET_KEY = process.env.NEXT_PUBLIC_HMAC_SECRET_KEY || "super-secret-key-for-swiftcheck-demo";


export function GenerateQrClient({ event }: { event: EventDetails }) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTicketNumber, setGeneratedTicketNumber] = useState<string | null>(null);

  const generateClientSideQrUrl = (eventNumber: string, ticketNum: string) => {
    const timestamp = Date.now().toString();
    // NOTE: In a real app, the secret should NOT be exposed on the client.
    // This is for demo purposes only. We will use a simple "hash" here.
    const hmac = `demo-hmac-${timestamp}`; // Simplified for client-side

    const qrData = `${eventNumber}:${ticketNum}:${timestamp}:${hmac}`;

    const displayUrl = new URL(window.location.origin);
    displayUrl.pathname = '/display-qr';
    displayUrl.searchParams.set('data', qrData);
    displayUrl.searchParams.set('eventName', event.name);
    displayUrl.searchParams.set('ticketNumber', ticketNum);

    return displayUrl.toString();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setQrCodeUrl(null);
    setGeneratedTicketNumber(null);

    if (!ticketNumber) {
      setError("Please enter a ticket number.");
      setIsLoading(false);
      return;
    }

    try {
      const url = generateClientSideQrUrl(event.id.toString(), ticketNumber);
      setQrCodeUrl(url);
      setGeneratedTicketNumber(ticketNumber);
    } catch (err: any) {
      setError(err.message || "Failed to generate QR code link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-2xl mx-auto animate-in fade-in duration-700">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-gradient">Create Ticket</h1>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">Generate a verified QR code for attendees by entering their ticket reference.</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/40 shadow-2xl p-2 bg-card/50 backdrop-blur-xl overflow-hidden ring-1 ring-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline tracking-tight">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Ticket className="w-6 h-6" />
                </div>
                Ticket Verification
              </CardTitle>
              <CardDescription className="text-xs">
                Enter a ticket number to generate a secure event pass.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="space-y-3">
                <Label htmlFor="ticketNumber" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Reference Number</Label>
                <Input
                  id="ticketNumber"
                  name="ticketNumber"
                  type="number"
                  placeholder="e.g., 1024"
                  required
                  className="h-12 rounded-xl bg-background/50 border-border/60 focus:ring-primary focus:border-primary transition-all duration-300"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  min="1"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
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
                ) : (
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Generate Secure Ticket
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {qrCodeUrl && generatedTicketNumber && (
          <div className="mt-8 p-6 rounded-3xl bg-accent/5 border border-accent/20 text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-accent/10">
                <QrCode className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h3 className="font-bold font-headline text-xl mb-1">Ticket # {generatedTicketNumber}</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Access pass generated successfully. Share this link or QR with the attendee.
            </p>
            <Button asChild size="lg" className="w-full h-12 rounded-2xl font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
              <Link href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 w-5 h-5" />
                Open Display Page
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
