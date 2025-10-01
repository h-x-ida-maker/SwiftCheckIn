import QRCode from "qrcode";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket } from "lucide-react";

async function generateQR(text: string) {
    try {
        return await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'M',
            margin: 2,
            scale: 8,
            color: {
                dark: '#0D1B2A',
                light: '#00000000'
            }
        });
    } catch (err) {
        console.error(err);
        return null;
    }
}

export default async function DisplayQRPage({ searchParams }: { searchParams: { data?: string, eventName?: string, ticketNumber?: string } }) {
    const { data, eventName, ticketNumber } = searchParams;

    if (!data) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Invalid QR Code Request</h1>
                <p className="text-muted-foreground">QR data is missing.</p>
            </div>
        );
    }

    const qrCodeUrl = await generateQR(data);

    return (
        <div className="flex justify-center items-start pt-10">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
                        <Ticket className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle>{eventName || 'Event Ticket'}</CardTitle>
                    <CardDescription>Scan this QR code at the entrance to check in. Ticket #{ticketNumber || 'N/A'}</CardDescription>
                </CardHeader>
                <CardContent>
                    {qrCodeUrl ? (
                        <Image
                            src={qrCodeUrl}
                            alt="Event Ticket QR Code"
                            width={300}
                            height={300}
                            className="mx-auto rounded-lg bg-white p-4"
                        />
                    ) : (
                        <div className="w-[300px] h-[300px] bg-muted flex items-center justify-center rounded-lg">
                            <p className="text-destructive-foreground">Could not generate QR code.</p>
                        </div>
                    )}
                     <p className="text-xs text-muted-foreground mt-4 break-all hidden">
                        Payload: {data}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
