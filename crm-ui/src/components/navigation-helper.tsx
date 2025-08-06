"use client";

import { useSession } from "next-auth/react";

export function useNavigationHelper() {
  const { data: session } = useSession();
  
  const getBasePath = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role === "ADMIN") return "/admin";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.role === "STAFF") return "/staff";
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { getBasePath, getRoutes, userRole: (session?.user as any)?.role };
} 