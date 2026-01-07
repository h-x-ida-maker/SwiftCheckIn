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
        <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 max-w-lg mx-auto animate-in fade-in duration-1000">
            <Card className="w-full relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/40 shadow-2xl ring-1 ring-border/50">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

                <CardHeader className="text-center pt-10">
                    <div className="mx-auto flex justify-center mb-6">
                        <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                            <Ticket className="w-8 h-8" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-extrabold font-headline tracking-tight text-gradient mb-2">
                        {eventName || 'Official Access Pass'}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium uppercase tracking-widest text-muted-foreground/80">
                        Ticket Number #{ticketNumber || 'DEMO-001'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    <div className="relative group mx-auto w-[280px] h-[280px]">
                        <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
                        <div className="relative p-6 bg-white rounded-3xl shadow-xl ring-1 ring-border/20">
                            {qrCodeUrl ? (
                                <Image
                                    src={qrCodeUrl}
                                    alt="Event Ticket QR Code"
                                    width={232}
                                    height={232}
                                    className="mx-auto"
                                />
                            ) : (
                                <div className="w-full aspect-square bg-muted flex flex-col items-center justify-center rounded-xl text-center p-4">
                                    <p className="text-xs font-bold text-destructive">QR Generation Failed</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">Standard Entry</span>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium uppercase tracking-widest leading-relaxed opacity-60">
                            Present this QR code at the event entrance for verification and entry.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
