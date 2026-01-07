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
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-gradient">Verify Ticket</h1>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">Securely scan and check in attendees using their unique QR codes.</p>
            </div>

            <Tabs defaultValue="camera" className="w-full max-w-md">
                <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden ring-1 ring-border/50 p-1">
                    <CardHeader className="text-center pb-6 pt-8">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/20 rounded-2xl h-14">
                            <TabsTrigger
                                value="camera"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-500 py-3"
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Live Camera</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-500 py-3"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Image Upload</span>
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="mt-2 min-h-[300px] flex flex-col justify-center">
                            <TabsContent value="camera" className="mt-0 focus-visible:ring-0 animate-in zoom-in-95 duration-500">
                                <div className="relative rounded-3xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 group">
                                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                                    <QrScanner />
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground mt-6 font-medium uppercase tracking-widest px-8 leading-relaxed opacity-60">
                                    Position the ticket's QR code within the frame to automatically check in the attendee.
                                </p>
                            </TabsContent>
                            <TabsContent value="upload" className="mt-0 focus-visible:ring-0 animate-in zoom-in-95 duration-500">
                                <div className="rounded-3xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10 p-8 flex flex-col items-center justify-center min-h-[300px] hover:border-primary/40 transition-colors duration-500">
                                    <QrFileScanner />
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground mt-6 font-medium uppercase tracking-widest px-8 leading-relaxed opacity-60">
                                    Upload a photo or screenshot of the ticket QR code for manual verification.
                                </p>
                            </TabsContent>
                        </div>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
