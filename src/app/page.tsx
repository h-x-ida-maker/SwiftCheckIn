import { getEvent, getCheckIns } from "@/lib/data";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Users, Calendar, BarChart } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { CheckIn } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function RecentCheckIns({ checkIns }: { checkIns: CheckIn[] }) {
    return (
        <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
                <CardDescription>The last 5 people who checked in.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Ticket No.</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {checkIns.slice(0, 5).map((checkin) => (
                            <TableRow key={checkin.id}>
                                <TableCell className="font-medium">{checkin.userName}</TableCell>
                                <TableCell>{checkin.ticketNumber}</TableCell>
                                <TableCell className="text-right">{format(new Date(checkin.checkInTime), "p")}</TableCell>
                            </TableRow>
                        ))}
                         {checkIns.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No check-ins yet.
                </TableCell>
              </TableRow>
            )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default async function DashboardPage() {
  const event = await getEvent();
  const checkIns = await getCheckIns();

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card p-8 rounded-lg border">
        <Ticket className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Event Loaded</h2>
        <p className="text-muted-foreground mt-2">
          Please import an event to get started.
        </p>
        <Button asChild className="mt-6">
          <Link href="/import">Import Event</Link>
        </Button>
      </div>
    );
  }

  const checkInCount = checkIns.length;
  const seatsRemaining = event.totalSeats - checkInCount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Event Name"
          value={event.name}
          icon={Ticket}
          description="The official name of the event"
        />
        <StatCard
          title="Event Date"
          value={format(new Date(event.date), "PPP")}
          icon={Calendar}
          description={format(new Date(event.date), "eeee, p")}
        />
        <StatCard
          title="Total Seats"
          value={event.totalSeats.toLocaleString()}
          icon={Users}
          description="Maximum capacity for the event"
        />
        <StatCard
          title="Checked In"
          value={`${checkInCount} / ${event.totalSeats}`}
          icon={BarChart}
          description={`${seatsRemaining.toLocaleString()} seats remaining`}
        />
      </div>
      <RecentCheckIns checkIns={checkIns} />
    </div>
  );
}
