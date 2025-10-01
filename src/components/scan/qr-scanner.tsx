"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validateAndCheckIn } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, XCircle, CheckCircle } from "lucide-react";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrScanner() {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;
    
    setScanResult(null);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    async function onScanSuccess(decodedText: string, decodedResult: any) {
      scanner.clear();
      setIsScanning(false);
      const result = await validateAndCheckIn(decodedText);
      setScanResult(result);
      toast({
        title: result.success ? "Success!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    }

    function onScanFailure(error: any) {
      // This callback is required but we can ignore errors.
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      // Cleanup function to stop scanner
      if (scanner && scanner.getState() === 2) { // 2 is SCANNING state
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
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
