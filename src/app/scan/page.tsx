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
        <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 p-4 dark:bg-background">
            <Tabs defaultValue="camera" className="w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden ring-1 ring-border/50">
                    <div className="h-2 bg-gradient-to-r from-primary to-blue-400" />
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            Scan Ticket
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground/80 font-medium">
                            Choose your preferred verification method
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8">
                            <TabsTrigger
                                value="camera"
                                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 py-2.5"
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                <span className="font-semibold">Camera</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 py-2.5"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                <span className="font-semibold">Upload</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-2 min-h-[300px] flex flex-col justify-center">
                            <TabsContent value="camera" className="mt-0 focus-visible:ring-0">
                                <div className="rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/10">
                                    <QrScanner />
                                </div>
                            </TabsContent>
                            <TabsContent value="upload" className="mt-0 focus-visible:ring-0">
                                <div className="rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/10 p-4">
                                    <QrFileScanner />
                                </div>
                            </TabsContent>
                        </div>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
