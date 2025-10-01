import { QrScanner } from '@/components/scan/qr-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
