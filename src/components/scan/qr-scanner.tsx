"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validateQrCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, XCircle, CheckCircle } from "lucide-react";
import { getEvent, addCheckIn, isTicketCheckedIn } from "@/lib/data";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrScanner() {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  // Use a ref to hold the scanner instance
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      setScanResult(null);

      const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        // Stop the scanner
        if (scannerRef.current) {
          await scannerRef.current.clear();
          scannerRef.current = null;
        }
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
        
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event("storage"));
        
        const message = `Ticket #${ticketNumber} checked in successfully!`;
        setScanResult({ success: true, message });
        toast({ title: "Success!", description: message });
      };

      const onScanFailure = (error: any) => {
        // This callback is required but we can ignore errors.
      };

      // Initialize the scanner
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      // Cleanup function to stop scanner when component unmounts or isScanning becomes false
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on cleanup", err));
        scannerRef.current = null;
      }
    };
  }, [isScanning, toast]);

  return (
    <div className="w-full max-w-md mx-auto">
        {isScanning && <div id="qr-reader" className="w-full rounded-lg overflow-hidden border"></div>}

        {scanResult && (
            <div className={`mt-4 p-4 rounded-lg flex flex-col items-center text-center ${scanResult.success ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                {scanResult.success ? <CheckCircle className="w-12 h-12 mb-2" /> : <XCircle className="w-12 h-12 mb-2" />}
                <p className="font-bold text-lg">{scanResult.message}</p>
                <Button onClick={() => setIsScanning(true)} variant={scanResult.success ? "default": "secondary"} className="mt-4">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan Another Ticket
                </Button>
            </div>
        )}
    </div>
  );
}
