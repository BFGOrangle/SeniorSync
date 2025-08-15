"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { useCurrentUser } from "@/contexts/user-context";
import { Route } from "@/enums/Route";
import FullPageSpinnerLoader from "@/components/full-page-spinner-loader";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push(Route.Signin);
      } else if (currentUser.role !== "ADMIN") {
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

  // Don't render anything if not authenticated or not admin (will redirect)
  if (!currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}