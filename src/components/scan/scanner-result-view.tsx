
import { CheckCircle, XCircle, ScanLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScannerResultViewProps {
    success: boolean;
    message: string;
    onRestart: () => void;
    restartIcon?: "scan" | "upload";
    restartText?: string;
}

export function ScannerResultView({
    success,
    message,
    onRestart,
    restartIcon = "scan",
    restartText = "Scan Another"
}: ScannerResultViewProps) {
    const Icon = success ? CheckCircle : XCircle;
    const RestartIcon = restartIcon === "scan" ? ScanLine : Upload;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center h-full py-8 text-center animate-in zoom-in-95 duration-300 px-6",
            success ? "text-green-600 dark:text-green-400" : "text-destructive"
        )}>
            <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl transition-transform duration-500",
                success
                    ? "bg-green-100 ring-4 ring-green-50 dark:bg-green-900/30 dark:ring-green-900/50"
                    : "bg-destructive/10 ring-4 ring-destructive/10"
            )}>
                <Icon className="w-10 h-10" />
            </div>

            <div className="space-y-2 mb-8 max-w-[280px]">
                <h3 className="text-2xl font-black tracking-tight font-headline">
                    {success ? 'Success!' : 'Scan Failed'}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {message}
                </p>
            </div>

            <Button
                onClick={onRestart}
                className={cn(
                    "rounded-2xl px-10 h-14 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-sm uppercase tracking-widest",
                    success && "shadow-green-500/20 hover:shadow-green-500/40"
                )}
            >
                <RestartIcon className="mr-2 h-4 w-4" />
                {restartText}
            </Button>
        </div>
    );
}
