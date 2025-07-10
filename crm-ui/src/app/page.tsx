"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    if (session?.user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (session?.user?.role === "STAFF") {
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
          Redirecting...
        </span>
      </div>
    </div>
  );
}
