
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Users, Calendar, BarChart, AlertTriangle, ListChecks } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { CheckIn } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCheckInData } from "@/hooks/use-check-in-data";
import { EmptyState } from "@/components/common/empty-state";

function RecentCheckIns({ checkIns }: { checkIns: CheckIn[] }) {
  return (
    <Card className="col-span-1 lg:col-span-4 overflow-hidden border-border/40 soft-shadow bg-card/50 backdrop-blur-sm rounded-3xl">
      <CardHeader className="bg-muted/10 pb-6 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold font-headline tracking-tight text-gradient">Recent Arrivals</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-1">Real-time check-in stream</CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-4 px-8 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/50">Attendee</TableHead>
              <TableHead className="py-4 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/50">Ticket</TableHead>
              <TableHead className="text-right py-4 px-8 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/50">Verified At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkIns.slice(0, 5).map((checkin, index) => (
              <TableRow key={checkin.id} className={cn(
                "group transition-all duration-300 hover:bg-primary/[0.02] border-border/10",
                index === checkIns.slice(0, 5).length - 1 && "border-none"
              )}>
                <TableCell className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-background transition-transform group-hover:scale-110",
                      index % 2 === 0 ? "bg-gradient-to-br from-primary to-indigo-600" : "bg-gradient-to-br from-emerald-400 to-teal-600"
                    )}>
                      {checkin.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{checkin.userName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">Verified Member</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-muted/30 border border-border/20">
                    #{checkin.ticketNumber}
                  </span>
                </TableCell>
                <TableCell className="text-right py-5 px-8">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-foreground">
                      {format(new Date(checkin.checkInTime), "p")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium opacity-60">
                      {formatDistanceToNow(new Date(checkin.checkInTime), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {checkIns.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <div className="p-6 rounded-3xl bg-muted/10 animate-pulse">
                      <ListChecks className="w-10 h-10 opacity-30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold font-headline text-foreground/40">Waiting for Arrivals</p>
                      <p className="text-xs opacity-60">Attendees will appear here as they check in.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { event, checkIns, isClient } = useCheckInData();

  if (!isClient) return null;

  if (!event) {
    return (
      <EmptyState
        title="Ready to Start?"
        description="It looks like you haven't loaded an event yet. Import your attendee list to begin managing check-ins."
        actionLabel="Import Event Now"
        actionHref="/import"
      />
    );
  }

  const checkInCount = checkIns.length;
  const seatsRemaining = event.totalSeats - checkInCount;
  const isOverCapacity = checkInCount > event.totalSeats;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {isOverCapacity && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold text-sm">Event Over Capacity</AlertTitle>
          <AlertDescription className="text-xs opacity-90">
            The number of checked-in attendees ({checkInCount}) has exceeded the total available seats ({event.totalSeats}).
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-gradient leading-tight">
            {event.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {format(new Date(event.date), "PPP")} at {format(new Date(event.date), "p")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Dashboard</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expected"
          value={event.totalSeats.toLocaleString()}
          icon={Users}
          description="Maximum capacity for the event"
        />
        <StatCard
          title="Checked In"
          value={checkInCount.toLocaleString()}
          icon={BarChart}
          description={`${((checkInCount / event.totalSeats) * 100).toFixed(1)}% of total capacity`}
          isWarning={isOverCapacity}
        />
        <StatCard
          title="Remaining"
          value={Math.max(0, seatsRemaining).toLocaleString()}
          icon={Ticket}
          description={isOverCapacity ? "Over capacity" : `${seatsRemaining.toLocaleString()} seats left`}
          isWarning={isOverCapacity}
        />
        <StatCard
          title="Status"
          value={isOverCapacity ? "Overbooked" : "Good"}
          icon={AlertTriangle}
          description={isOverCapacity ? "Check capacity settings" : "Ready for check-ins"}
          isWarning={isOverCapacity}
        />
      </div>

      <div className="grid gap-6">
        <RecentCheckIns checkIns={checkIns} />
      </div>
    </div>
  );
}
