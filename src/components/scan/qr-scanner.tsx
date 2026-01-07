
"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { validateQrCode } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { VideoOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processDecodedText } from "@/lib/scanner";
import { ScannerResultView } from "./scanner-result-view";

type ScanResult = {
    success: boolean;
    message: string;
}

export function QrScanner() {
    const { toast } = useToast();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
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
                    async (decodedText) => {
                        if (!mounted) return;

                        // Stop immediately
                        try { await scanner.stop(); } catch (e) { console.warn(e); }

                        setIsScanning(false);
                        const { success, message } = await processDecodedText(decodedText);
                        setResult({ success, message });

                        if (success) {
                            toast({ title: "Success!", description: message });
                        } else {
                            toast({ title: "Error", description: message, variant: "destructive" });
                        }
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
        setResult(null);
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

            {result && (
                <ScannerResultView
                    success={result.success}
                    message={result.message}
                    onRestart={handleRestart}
                    restartText="Scan Another Ticket"
                />
            )}
        </div>
    );
}
