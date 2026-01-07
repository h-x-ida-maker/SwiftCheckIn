
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { validateQrCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, XCircle, CheckCircle, VideoOff } from "lucide-react";
import { getEvent, addCheckIn, isTicketCheckedIn } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrScanner() {
    const { toast } = useToast();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const readerId = "qr-reader-v4";

    useEffect(() => {
        if (!isScanning) return;

        // Ensure container is empty before starting
        const container = document.getElementById(readerId);
        if (container) container.innerHTML = "";

        const scanner = new Html5Qrcode(readerId);
        let mounted = true;

        const startScanner = async () => {
            try {
                const config: Html5QrcodeCameraScanConfig = {
                    fps: 10,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdge * 0.8);
                        return { width: qrboxSize, height: qrboxSize };
                    },
                    aspectRatio: 1.0,
                };

                await scanner.start(
                    { facingMode: "environment" },
                    config,
                    async (decodedText: string) => {
                        if (!mounted) return;

                        // Stop immediately to prevent double scans
                        try {
                            if (scanner.isScanning) {
                                await scanner.stop();
                            }
                        } catch (e) {
                            console.warn("Stop on success error:", e);
                        }

                        setIsScanning(false);

                        const currentEvent = getEvent();
                        if (!currentEvent) {
                            setScanResult({ success: false, message: "No event loaded." });
                            return;
                        }

                        const validationResult = await validateQrCode(decodedText, currentEvent.id);

                        if (!validationResult.success || validationResult.ticketNumber === null) {
                            setScanResult({ success: false, message: validationResult.message });
                            toast({ title: "Error", description: validationResult.message, variant: "destructive" });
                            return;
                        }

                        if (isTicketCheckedIn(currentEvent.id, validationResult.ticketNumber)) {
                            const msg = `Ticket #${validationResult.ticketNumber} already checked in.`;
                            setScanResult({ success: false, message: msg });
                            toast({ title: "Error", description: msg, variant: "destructive" });
                            return;
                        }

                        addCheckIn({
                            eventId: currentEvent.id,
                            ticketNumber: validationResult.ticketNumber,
                            userName: `User #${validationResult.ticketNumber}`,
                            checkInTime: new Date().toISOString(),
                        });

                        window.dispatchEvent(new Event("storage"));
                        setScanResult({ success: true, message: `Ticket #${validationResult.ticketNumber} checked in!` });
                        toast({ title: "Success!", description: `Ticket #${validationResult.ticketNumber} checked in!` });
                    },
                    () => { } // ignore scan errors
                );
            } catch (err: any) {
                if (!mounted) return;
                console.error("Scanner start error:", err);
                const isPermissionError = err?.name === 'NotAllowedError' || (typeof err === 'string' && err.includes('Permission denied'));
                setCameraError(isPermissionError ? "Camera access denied. Please enable permissions." : "Could not start camera.");
                setIsScanning(false);
            }
        };

        // Delay slightly to ensure DOM is ready
        const timeoutId = setTimeout(startScanner, 100);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            if (scanner.isScanning) {
                scanner.stop().then(() => scanner.clear()).catch(() => { });
            } else {
                try { scanner.clear(); } catch (e) { }
            }
        };
    }, [isScanning, toast]);

    const handleRestart = async () => {
        if (scannerRef.current?.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {
                console.warn("Manual restart stop failed:", e);
            }
        }
        scannerRef.current = null;
        setScanResult(null);
        setCameraError(null);
        setIsScanning(true);
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {isScanning && !cameraError && (
                <div className="overflow-hidden rounded-3xl bg-muted/10">
                    <div id={readerId} className="w-full aspect-square"></div>
                </div>
            )}

            {cameraError && (
                <Alert variant="destructive" className="mt-4 rounded-2xl">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription className="text-sm">{cameraError}</AlertDescription>
                    <Button onClick={handleRestart} variant="outline" className="mt-4 w-full rounded-xl">
                        Try Again
                    </Button>
                </Alert>
            )}

            {scanResult && (
                <div className={cn(
                    "mt-4 p-8 rounded-3xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300",
                    scanResult.success ? "bg-green-500/10 text-green-600 ring-1 ring-green-500/20" : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
                )}>
                    {scanResult.success ? <CheckCircle className="w-16 h-16 mb-4" /> : <XCircle className="w-16 h-16 mb-4" />}
                    <p className="font-bold text-lg mb-6 leading-tight text-foreground">{scanResult.message}</p>
                    <Button onClick={handleRestart} className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold">
                        <ScanLine className="mr-2 h-4 w-4" />
                        Scan Another Ticket
                    </Button>
                </div>
            )}
        </div>
    );
}
