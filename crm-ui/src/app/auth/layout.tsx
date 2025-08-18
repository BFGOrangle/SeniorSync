"use client";
import FullPageSpinnerLoader from "@/components/full-page-spinner-loader";
import { useCurrentUser } from "@/contexts/user-context";
import { useNavigationHelper } from "@/lib/navigation-helper";
import { Building2 } from "lucide-react";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser();
  const { goToDashboard } = useNavigationHelper();

  // Redirect authenticated users at layout level
  useEffect(() => {
    if (!isLoading && currentUser) {
      goToDashboard();
    }
  }, [isLoading, currentUser, goToDashboard]);

  // Show loading while checking auth OR while user is authenticated (redirecting)
  if (isLoading || currentUser) {
    return (
      <FullPageSpinnerLoader 
        loadingMessage={currentUser ? "Redirecting..." : ""} 
      />
    );
  }

  // Only render auth pages if user is definitely not authenticated
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-lg p-3 md:h-36"></div>
        <div className="flex flex-col items-center mb-8 pb-2">
          <a href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SeniorSync CRM</h1>
          </a>
          <p className="text-gray-600 text-center">
            Senior Care Management System
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
