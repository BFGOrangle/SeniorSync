"use client";

import { CurrentUser, useCurrentUser } from "@/contexts/user-context";
import { Route } from "@/enums/Route";
import { useRouter } from "next/navigation";

export function getDashboardRoute(user: CurrentUser | null): string {
    if (!user) {
        throw new Error("User object is null");
    } else if (user.role === 'ADMIN') {
        return '/admin/dashboard';
    } else if (user.role === 'STAFF') {
        return '/staff/request-management';
    } else {
        throw new Error("Unknown user role");
    }
}

export function useNavigationHelper() {
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  const getRoutes = () => {
    const isAdmin = currentUser?.role === 'ADMIN';
    const baseRoute = isAdmin ? '/admin' : '/staff';

    return {
      dashboard: () => `${baseRoute}/dashboard`,
      requests: (id?: string) => id ? `${baseRoute}/requests/${id}` : `${baseRoute}/request-management`,
      seniors: (id?: string) => id ? `${baseRoute}/seniors/${id}` : `${baseRoute}/senior-profiles`,
      settings: () => `${baseRoute}/settings`,
      aiRecommendations: () => `${baseRoute}/ai-recommendations`,
    };
  };

  const goToSignin = () => {
    router.push(Route.Signin);
  }

  const getDashboardRoute = (): string => {
    if (!currentUser) {
        throw new Error("User object is null");
    } else if (currentUser.role === 'ADMIN') {
        return '/admin/dashboard';
    } else if (currentUser.role === 'STAFF') {
        return '/staff/request-management';
    } else {
      throw new Error("Unknown user role");
    }
  }

  const goToDashboard = () => {
      const route = getDashboardRoute();
      router.push(route);
    };

  return {
    getRoutes,
    getDashboardRoute,
    goToSignin,
    goToDashboard,
    isAdmin: currentUser?.role === 'ADMIN',
    isStaff: currentUser?.role === 'STAFF',
    isAuthenticated: !!currentUser,
  };
}