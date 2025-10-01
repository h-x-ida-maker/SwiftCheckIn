import { getEvent, getCheckIns } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

export default async function CheckInLogPage() {
  const event = await getEvent();
  const checkIns = await getCheckIns();

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card p-8 rounded-lg border">
        <Ticket className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Event Loaded</h2>
        <p className="text-muted-foreground mt-2">
          Import an event to see check-in logs.
        </p>
        <Button asChild className="mt-6">
          <Link href="/import">Import Event</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in Log for {event.name}</CardTitle>
        <CardDescription>
            A detailed log of all check-in activities for the current event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ticket #</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Check-in Time</TableHead>
              <TableHead className="text-right">Full Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkIns.length > 0 ? (
              checkIns.map((checkin) => (
                <TableRow key={checkin.id}>
                  <TableCell className="font-medium">{checkin.ticketNumber}</TableCell>
                  <TableCell>{checkin.userName}</TableCell>
                  <TableCell>{format(new Date(checkin.checkInTime), "PPp")}</TableCell>
                  <TableCell className="text-right">{new Date(checkin.checkInTime).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No check-ins yet.
                TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
