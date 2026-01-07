
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, type Html5QrcodeCameraScanConfig, type Html5QrcodeResult, type QrCodeSuccessCallback } from "html5-qrcode";
import { validateQrCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, XCircle, CheckCircle, VideoOff } from "lucide-react";
import { getEvent, addCheckIn, isTicketCheckedIn } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrScanner() {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const readerId = "qr-reader";

  useEffect(() => {
    // This effect handles the setup and teardown of the scanner
    if (isScanning && !scannerRef.current) {
        const qrScanner = new Html5Qrcode(readerId, { 
            verbose: false // Set to true for more detailed logs
        });
        scannerRef.current = qrScanner;

        const onScanSuccess: QrCodeSuccessCallback = async (decodedText: string, result: Html5QrcodeResult) => {
            // Prevent multiple scans from being processed
            if (!isScanning) return;
            
            // Stop scanning and update state
            setIsScanning(false);
            
            const currentEvent = getEvent();
            if (!currentEvent) {
                setScanResult({ success: false, message: "No event loaded. Please import an event first." });
                return;
            }

            const validationResult = await validateQrCode(decodedText, currentEvent.id);

            if (!validationResult.success || validationResult.ticketNumber === null) {
                setScanResult({ success: false, message: validationResult.message });
                toast({
                    title: "Error",
                    description: validationResult.message,
                    variant: "destructive",
                });
                return;
            }

            const { ticketNumber } = validationResult;
            
            if (isTicketCheckedIn(currentEvent.id, ticketNumber)) {
                const message = `Ticket #${ticketNumber} has already been checked in.`;
                setScanResult({ success: false, message });
                toast({ title: "Error", description: message, variant: "destructive" });
                return;
            }
            
            addCheckIn({
                eventId: currentEvent.id,
                ticketNumber: ticketNumber,
                userName: `User #${ticketNumber}`, // Placeholder user name
                checkInTime: new Date().toISOString(),
            });
            
            // Notify other components of the data change
            window.dispatchEvent(new Event("storage"));
            
            const message = `Ticket #${ticketNumber} checked in successfully!`;
            setScanResult({ success: true, message });
            toast({ title: "Success!", description: message });
        };
        
        const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.8);
          return {
            width: qrboxSize,
            height: qrboxSize,
          };
        };

        const config: Html5QrcodeCameraScanConfig = { 
            fps: 10, 
            qrbox: qrboxFunction,
            aspectRatio: 1.0,
        };

        qrScanner.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            (errorMessage) => { /* Ignore scan failure */ }
        ).catch((err) => {
            console.error("Camera start error:", err);
            if (err.name === 'NotAllowedError' || err.includes?.('Permission denied')) {
                setCameraError("Camera access denied. Please enable camera permissions in your browser settings.");
            } else {
                setCameraError("Could not start camera. Please ensure it's not in use by another application.");
            }
            setIsScanning(false);
        });

    } else if (!isScanning && scannerRef.current) {
        // Stop the scanner if it's running and we're not supposed to be scanning
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current = null;
            }).catch(err => {
                // This can happen if the scanner is already stopped or in a state where it can't be stopped.
                // We can safely ignore it in most cases.
                console.warn("Scanner stop error (ignoring):", err);
                scannerRef.current = null;
            });
        } else {
             scannerRef.current = null;
        }
    }

    // Cleanup function to run when the component unmounts
    return () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(err => {
                console.error("Scanner cleanup failed:", err);
            });
        }
    };
}, [isScanning, toast]);
  
  const handleRestart = () => {
    setScanResult(null);
    setCameraError(null);
    setIsScanning(true);
  }

  return (
    <div className="w-full max-w-md mx-auto">
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div id={readerId} className="w-full bg-muted aspect-square"></div>
            </CardContent>
        </Card>

        {cameraError && (
            <Alert variant="destructive" className="mt-4">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
                <Button onClick={handleRestart} variant="secondary" className="mt-4">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </Alert>
        )}

        {scanResult && (
            <div className={`mt-4 p-4 rounded-lg flex flex-col items-center text-center ${scanResult.success ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                {scanResult.success ? <CheckCircle className="w-12 h-12 mb-2 text-green-500" /> : <XCircle className="w-12 h-12 mb-2 text-red-500" />}
                <p className="font-bold text-lg">{scanResult.message}</p>
                <Button onClick={handleRestart} variant="default" className="mt-4 bg-gray-800 text-white hover:bg-gray-700">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan Another Ticket
                </Button>
            </div>
        )}
    </div>
  );
}
