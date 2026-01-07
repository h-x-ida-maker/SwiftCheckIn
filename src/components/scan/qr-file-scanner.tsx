
"use client";

import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScanLine, Upload, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { processDecodedText } from "@/lib/scanner";
import { ScannerResultView } from "./scanner-result-view";

export function QrFileScanner() {
    const { toast } = useToast();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("qr-reader-file", { verbose: false });
        }

        try {
            const decodedText = await html5QrCodeRef.current.scanFile(file, false);
            const scanRes = await processDecodedText(decodedText);

            setResult({ success: scanRes.success, message: scanRes.message });
            if (!scanRes.success) setError(scanRes.message);

            if (scanRes.success) {
                toast({ title: "Success!", description: scanRes.message });
            } else {
                toast({ title: "Error", description: scanRes.message, variant: "destructive" });
            }
        } catch (err: any) {
            const msg = err?.message || "No QR code found in the image.";
            setError(msg);
            toast({ title: "Scan Failed", description: msg, variant: "destructive" });
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRestart = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="w-full h-full min-h-[200px] flex flex-col justify-center">
            <div id="qr-reader-file" style={{ display: 'none' }}></div>

            {!result ? (
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
                        <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-full flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <ScannerResultView
                    success={result.success}
                    message={result.message}
                    onRestart={handleRestart}
                    restartIcon="upload"
                    restartText="Scan Another"
                />
            )}
        </div>
    );
}
