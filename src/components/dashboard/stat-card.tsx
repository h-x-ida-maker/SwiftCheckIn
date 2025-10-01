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
    <Card className={cn(isWarning && "border-destructive/50 bg-destructive/10")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium", isWarning && "text-destructive")}>{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", isWarning && "text-destructive")} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", isWarning && "text-destructive")}>{value}</div>
        {description && (
          <p className={cn("text-xs text-muted-foreground", isWarning && "text-destructive/80")}>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
