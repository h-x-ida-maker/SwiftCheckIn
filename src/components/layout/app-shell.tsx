
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  QrCode,
  Upload,
  Ticket,
  PlusCircle,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import type { EventDetails } from "@/lib/types";
import { getEvent } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [event, setEvent] = useState<EventDetails | null>(null);

  useEffect(() => {
    // Function to load event from storage
    const loadEvent = () => {
      setEvent(getEvent());
    };

    // Load the event initially
    loadEvent();

    // Listen for the custom storage event
    window.addEventListener("storage", loadEvent);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("storage", loadEvent);
    };
  }, []);


  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/20 bg-card/85 backdrop-blur-2xl shadow-sm">
        <SidebarHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-headline tracking-tight group-data-[collapsible=icon]:hidden">
              SwiftCheck
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Dashboard"
              >
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {event && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/check-in-log"}
                    tooltip="Check-in Log"
                  >
                    <Link href="/check-in-log">
                      <ListChecks />
                      <span>Check-in Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/generate-qr"}
                    tooltip="Generate Ticket"
                  >
                    <Link href="/generate-qr">
                      <PlusCircle />
                      <span>Generate Ticket</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/import"}
                tooltip="Import Event"
              >
                <Link href="/import">
                  <Upload />
                  <span>Import Event</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background/50">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-md md:px-8">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold font-headline tracking-tight hidden md:block text-gradient">
            {getHeaderTitle(pathname)}
          </h2>
          <div className="flex-1 md:hidden"></div>
          {pathname === "/" && (
            <Button asChild variant="default" size="sm" disabled={!event} className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              <Link href="/scan">
                <QrCode className="mr-2 h-4 w-4" />
                Scan Ticket
              </Link>
            </Button>
          )}
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function getHeaderTitle(pathname: string): string {
  switch (pathname) {
    case "/":
      return "Event Dashboard";
    case "/check-in-log":
      return "Check-in Log";
    case "/import":
      return "Import Event";
    case "/scan":
      return "Scan Ticket";
    case "/generate-qr":
      return "Generate Ticket";
    default:
      if (pathname.startsWith("/display-qr")) {
        return "Your Ticket";
      }
      return "SwiftCheck";
  }
}
