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
            html5QrCodeRef.current = new Html5Qrcode( "qr-reader-file", { verbose: false });
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
            if(fileInputRef.current) {
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
        <div className="w-full max-w-md mx-auto text-center">
            {/* Hidden div for the library */}
            <div id="qr-reader-file" style={{ display: 'none' }}></div>
            
            {!scanResult ? (
                 <div className="space-y-4">
                    <Label htmlFor="qr-code-file" className="text-sm text-muted-foreground">
                        Select an image file containing a QR code.
                    </Label>
                    <Input
                        id="qr-code-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isLoading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                     {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Scanning image...</p>}
                     {error && (
                         <p className="text-sm text-destructive flex items-center justify-center gap-2">
                             <AlertCircle className="w-4 h-4" />
                             {error}
                         </p>
                     )}
                 </div>
            ) : (
                <div className={`mt-4 p-4 rounded-lg flex flex-col items-center text-center ${scanResult.success ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {scanResult.success ? <CheckCircle className="w-12 h-12 mb-2 text-green-500" /> : <XCircle className="w-12 h-12 mb-2 text-red-500" />}
                    <p className="font-bold text-lg">{scanResult.message}</p>
                    <Button onClick={handleRestart} variant="default" className="mt-4 bg-gray-800 text-white hover:bg-gray-700">
                        <Upload className="mr-2 h-4 w-4" />
                        Scan Another File
                    </Button>
                </div>
            )}
        </div>
    );
}
