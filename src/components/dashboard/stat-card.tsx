import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isWarning?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, isWarning = false }: StatCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-500 hover:soft-shadow hover:-translate-y-1 group relative rounded-2xl",
      isWarning ? "border-destructive/30 bg-destructive/5" : "card-warm border-border/40 hover:border-primary/20"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary/70",
          isWarning && "text-destructive"
        )}>
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          isWarning ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold font-headline tracking-tight",
          isWarning && "text-destructive"
        )}>
          {value}
        </div>
        {description && (
          <p className={cn(
            "text-[10px] font-medium text-muted-foreground mt-1",
            isWarning && "text-destructive/80"
          )}>
            {description}
          </p>
        )}
      </CardContent>
      <div className={cn(
        "absolute bottom-0 left-0 h-1 transition-all duration-300",
        isWarning ? "bg-destructive w-full" : "bg-primary w-0 group-hover:w-full"
      )} />
    </Card>
  );
}
