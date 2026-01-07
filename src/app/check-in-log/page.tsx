"use client";

import { useState, useEffect } from "react";
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
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket, Search, Clock, Users, ArrowLeft } from "lucide-react";
import type { CheckIn, EventDetails } from "@/lib/types";
import { useIsClient } from "@/hooks/use-is-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CheckInLogPage() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      const loadData = () => {
        setEvent(getEvent());
        setCheckIns(getCheckIns());
      }
      loadData();

      window.addEventListener('storage', loadData);
      return () => {
        window.removeEventListener('storage', loadData);
      }
    }
  }, [isClient]);

  const filteredCheckIns = checkIns.filter(c =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketNumber.toString().includes(searchQuery)
  );

  if (!isClient) {
    return null;
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-sm mx-auto animate-in fade-in duration-700">
        <div className="p-6 rounded-3xl bg-primary/5 mb-6 ring-1 ring-primary/10">
          <Ticket className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold font-headline tracking-tight mb-2">No Event Found</h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          Please import an event to view the check-in history.
        </p>
        <Button asChild size="lg" className="mt-8 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
          <Link href="/import">Import Event</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between px-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-gradient leading-tight">
            Check-in History
          </h1>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {checkIns.length} attendees verified for <span className="text-foreground font-bold">{event.name}</span>
          </p>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name or ticket..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border-border/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-[120px] text-[10px] font-bold uppercase tracking-widest py-4">Ticket</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Attendee</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Verified At</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-4 pr-6">Detailed TS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCheckIns.length > 0 ? (
              filteredCheckIns.map((checkin, index) => (
                <TableRow key={checkin.id} className="group hover:bg-muted/20 border-border/20 transition-colors">
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-mono bg-background text-[10px] py-0.5 border-border/60">
                      #{checkin.ticketNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-border/40">
                        <AvatarFallback className={cn(
                          "text-white font-bold text-xs",
                          index % 3 === 0 ? "bg-gradient-to-br from-primary to-indigo-600" :
                            index % 3 === 1 ? "bg-gradient-to-br from-emerald-400 to-green-600" :
                              "bg-gradient-to-br from-orange-400 to-rose-600"
                        )}>
                          {checkin.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sm tracking-tight">{checkin.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatDistanceToNow(new Date(checkin.checkInTime), { addSuffix: true })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                      {format(new Date(checkin.checkInTime), "MMM d, HH:mm:ss")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <Search className="w-10 h-10 mb-2" />
                    <p className="font-headline font-bold text-lg">No entries found</p>
                    <p className="text-xs max-w-[200px] mx-auto">Try adjusting your search query or check back after next check-in.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
