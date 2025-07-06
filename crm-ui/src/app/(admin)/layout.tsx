"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { UserProvider } from "@/contexts/user-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">SeniorSync CRM</h1>
              <span className="text-sm text-muted-foreground">
                Senior Care Management System
              </span>
            </div>
          </header>
          
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </UserProvider>
  );
} 