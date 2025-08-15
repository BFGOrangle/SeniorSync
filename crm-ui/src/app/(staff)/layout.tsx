"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { StaffSidebar } from "@/components/staff-sidebar";
import { useCurrentUser } from "@/contexts/user-context";
import { Loader2 } from "lucide-react";
import { Route } from "@/enums/Route";
import FullPageSpinnerLoader from "@/components/full-page-spinner-loader";

function StaffLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push(Route.Signin);
      } else if (currentUser.role !== "STAFF") {
        router.push(Route.Unauthorized);
      }
    }
  }, [isLoading, currentUser, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <FullPageSpinnerLoader/>
    );
  }

  // Don't render anything if not authenticated or not staff (will redirect)
  if (!currentUser || currentUser.role !== "STAFF") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <StaffSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayoutContent>{children}</StaffLayoutContent>;
}