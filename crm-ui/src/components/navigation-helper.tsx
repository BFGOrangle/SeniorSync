"use client";

import { useSession } from "next-auth/react";

export function useNavigationHelper() {
  const { data: session } = useSession();
  
  const getBasePath = () => {
    if (session?.user?.role === "ADMIN") return "/admin";
    if (session?.user?.role === "STAFF") return "/staff";
    return "/admin"; // fallback
  };
  
  const getRoutes = () => {
    const basePath = getBasePath();
    return {
      dashboard: `${basePath}/dashboard`,
      requestManagement: `${basePath}/request-management`,
      seniorProfiles: `${basePath}/senior-profiles`,
      settings: `${basePath}/settings`,
      requests: (id: string) => `${basePath}/requests/${id}`,
      createRequest: `${basePath}/create-senior-request`,
    };
  };
  
  return { getBasePath, getRoutes, userRole: session?.user?.role };
} 