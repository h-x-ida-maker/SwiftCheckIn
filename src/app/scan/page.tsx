"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload } from "lucide-react";

const QrScanner = dynamic(
    () => import('@/components/scan/qr-scanner').then(mod => mod.QrScanner),
    { 
        ssr: false,
        loading: () => <Skeleton className="w-full aspect-square max-w-md mx-auto" />
    }
);

const QrFileScanner = dynamic(
    () => import('@/components/scan/qr-file-scanner').then(mod => mod.QrFileScanner),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-[200px]" />
    }
);

export default function ScanPage() {
  return (
    <div className="flex justify-center">
        <Tabs defaultValue="camera" className="w-full max-w-lg">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Scan Ticket</CardTitle>
                    <CardDescription>Choose your preferred method to scan a ticket's QR code.</CardDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="camera">
                            <Camera className="mr-2 h-4 w-4" />
                            Camera
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="camera">
                        <QrScanner />
                    </TabsContent>
                    <TabsContent value="upload">
                        <QrFileScanner />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    </div>
  );
}
