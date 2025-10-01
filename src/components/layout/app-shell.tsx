
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
  Armchair,
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Ticket className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
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
                isActive={pathname === "/import"}
                tooltip="Import Event"
              >
                <Link href="/import">
                  <Upload />
                  <span>Import Event</span>
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
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/seat-availability"}
                tooltip="Seat Availability"
              >
                <Link href="/seat-availability">
                  <Armchair />
                  <span>Seat Availability</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-card md:bg-transparent">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-lg font-semibold hidden md:block">
            {getHeaderTitle(pathname)}
          </h2>
          <div className="flex-1 md:hidden"></div>
          <Button asChild variant="outline" size="sm">
            <Link href="/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Scan Ticket
            </Link>
          </Button>
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
    case "/seat-availability":
      return "Seat Availability Tool";
    default:
      if (pathname.startsWith("/display-qr")) {
        return "Your Ticket";
      }
      return "SwiftCheck";
  }
}
