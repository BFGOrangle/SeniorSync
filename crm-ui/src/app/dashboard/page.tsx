"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/contexts/user-context";
import FullPageSpinnerLoader from "@/components/full-page-spinner-loader";
import { useNavigationHelper } from "@/lib/navigation-helper";

export default function DashboardRedirect() {
  const { currentUser, isLoading } = useCurrentUser();
  const { goToSignin, goToDashboard } = useNavigationHelper();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        goToSignin()
        return;
      }
      // Redirect based on user role
      goToDashboard();
    }
  }, [currentUser, isLoading]);

  return <FullPageSpinnerLoader />;
}
