"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGoToDashboard = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role === "ADMIN") {
      router.push("/admin/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((session?.user as any)?.role === "STAFF") {
      router.push("/staff/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <strong>Unauthorized Access:</strong> This page is restricted to {(session?.user as any)?.role === "ADMIN" ? "staff members" : "administrators"} only. 
            Please contact your system administrator if you believe this is an error.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={handleGoToDashboard} 
            className="w-full"
            variant="default"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to My Dashboard
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <p>Current Role: <span className="font-medium">{(session?.user as any)?.role}</span></p>
          <p>User: <span className="font-medium">{session?.user?.name}</span></p>
        </div>
      </div>
    </div>
  );
} 