"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from 'next-auth/react';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: string | null;
  centerId: number | null;
  centerName: string | null;
  userRole: string | null;
}

/**
 * Hook to access authentication state and JWT token
 * This provides easy access to the backend JWT token for API calls
 */
export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    token: (session as any)?.accessToken || null,
    userId: (session?.user as any)?.id || null,
    centerId: (session?.user as any)?.centerId || null,
    centerName: (session?.user as any)?.centerName || null,
    userRole: (session?.user as any)?.role || null,
  };
}

/**
 * Hook to get the current JWT token for API calls
 */
export function useAuthToken(): string | null {
  const { token } = useAuth();
  return token;
}

/**
 * Hook to get the current user's center information
 */
export function useUserCenter(): { centerId: number | null; centerName: string | null } {
  const { centerId, centerName } = useAuth();
  return { centerId, centerName };
}
