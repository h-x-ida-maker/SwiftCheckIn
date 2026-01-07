
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    icon?: any;
    className?: string;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
    icon: Icon = Ticket,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto animate-in fade-in duration-700 px-6",
            className
        )}>
            <div className="p-8 rounded-[2.5rem] bg-primary/5 mb-8 ring-1 ring-primary/10 relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                <Icon className="w-16 h-16 text-primary relative z-10 animate-pulse" />
            </div>

            <h2 className="text-4xl font-black font-headline tracking-tighter mb-3 grad-text">
                {title}
            </h2>

            <p className="text-muted-foreground leading-relaxed text-sm font-medium opacity-80 max-w-[320px]">
                {description}
            </p>

            <Button
                asChild
                size="lg"
                className="mt-10 px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-bold uppercase tracking-widest text-xs"
            >
                <Link href={actionHref}>{actionLabel}</Link>
            </Button>
        </div>
    );
}
