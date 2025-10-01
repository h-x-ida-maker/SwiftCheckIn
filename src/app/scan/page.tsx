"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const QrScanner = dynamic(
    () => import('@/components/scan/qr-scanner').then(mod => mod.QrScanner),
    { 
        ssr: false,
        loading: () => <Skeleton className="w-[420px] h-[300px]" />
    }
);

export default function ScanPage() {
  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Position a ticket's QR code within the frame to scan it.</CardDescription>
            </CardHeader>
            <CardContent>
                <QrScanner />
            </CardContent>
        </Card>
    </div>
  );
}
