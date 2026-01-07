"use client";

import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { validateQrCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, XCircle, CheckCircle, Upload, AlertCircle } from "lucide-react";
import { getEvent, addCheckIn, isTicketCheckedIn } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrFileScanner() {
    const { toast } = useToast();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setScanResult(null);

        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("qr-reader-file", { verbose: false });
        }
        const scanner = html5QrCodeRef.current;

        try {
            const decodedText = await scanner.scanFile(file, false);
            await processScan(decodedText);
        } catch (err: any) {
            const errorMessage = err?.message || "No QR code found in the image.";
            setError(errorMessage);
            toast({
                title: "Scan Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            // Reset file input to allow scanning the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const processScan = async (decodedText: string) => {
        const currentEvent = getEvent();
        if (!currentEvent) {
            const result = { success: false, message: "No event loaded. Please import an event first." };
            setScanResult(result);
            setError(result.message);
            return;
        }

        const validationResult = await validateQrCode(decodedText, currentEvent.id);

        if (!validationResult.success || validationResult.ticketNumber === null) {
            setScanResult({ success: false, message: validationResult.message });
            setError(validationResult.message);
            toast({ title: "Error", description: validationResult.message, variant: "destructive" });
            return;
        }

        const { ticketNumber } = validationResult;

        if (isTicketCheckedIn(currentEvent.id, ticketNumber)) {
            const message = `Ticket #${ticketNumber} has already been checked in.`;
            setScanResult({ success: false, message });
            setError(message);
            toast({ title: "Error", description: message, variant: "destructive" });
            return;
        }

        addCheckIn({
            eventId: currentEvent.id,
            ticketNumber: ticketNumber,
            userName: `User #${ticketNumber}`,
            checkInTime: new Date().toISOString(),
        });

        window.dispatchEvent(new Event("storage"));

        const message = `Ticket #${ticketNumber} checked in successfully!`;
        setScanResult({ success: true, message });
        toast({ title: "Success!", description: message });
    }

    const handleRestart = () => {
        setScanResult(null);
        setError(null);
    }

    return (
        <div className="w-full h-full min-h-[200px] flex flex-col justify-center">
            {/* Hidden div for the library */}
            <div id="qr-reader-file" style={{ display: 'none' }}></div>

            {!scanResult ? (
                <div
                    className="flex flex-col items-center justify-center h-full gap-4 cursor-pointer p-4 group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="p-4 rounded-full bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-300 dark:bg-muted/50">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <p className="font-semibold text-lg tracking-tight">Click to upload QR Code</p>
                        <p className="text-sm text-muted-foreground">Select an image from your device</p>
                    </div>

                    <Input
                        id="qr-code-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isLoading}
                        className="hidden"
                    />

                    {isLoading && (
                        <div className="flex items-center gap-2 text-primary font-medium animate-pulse">
                            <ScanLine className="w-4 h-4" />
                            <span>Scanning image...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-6 animate-in zoom-in-95 duration-300">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${scanResult.success
                            ? 'bg-green-100 text-green-600 ring-4 ring-green-50 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/50'
                            : 'bg-destructive/10 text-destructive ring-4 ring-destructive/10'
                        }`}>
                        {scanResult.success ? (
                            <CheckCircle className="w-10 h-10" />
                        ) : (
                            <XCircle className="w-10 h-10" />
                        )}
                    </div>

                    <div className="text-center space-y-2 mb-8 max-w-[280px]">
                        <h3 className={`text-xl font-bold ${scanResult.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                            {scanResult.success ? 'Check-in Successful' : 'Scan Failed'}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {scanResult.message}
                        </p>
                    </div>

                    <Button
                        onClick={handleRestart}
                        className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Scan Another
                    </Button>
                </div>
            )}
        </div>
    );
}
