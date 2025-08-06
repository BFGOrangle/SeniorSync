"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role === "ADMIN") {
      router.push("/admin/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((session?.user as any)?.role === "STAFF") {
      router.push("/staff/dashboard");
    } else {
      // Fallback for unknown roles or missing role
      router.push("/login");
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-600 font-medium">
          Redirecting to dashboard...
        </span>
      </div>
    </div>
  );
}
