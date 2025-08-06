"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { UserProvider } from "@/contexts/user-context";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [status, router, session?.user]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not an admin (will redirect)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (status === "unauthenticated" || (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")) {
    return null;
  }

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