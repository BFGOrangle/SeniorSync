"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  jobTitle: string;
  email: string;
  fullName: string;
  centerId: number;
  centerName: string;
}

interface UserContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  useEffect(() => {
    if (session?.user) {
      const user: CurrentUser = {
        id: parseInt((session.user as any).id),
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
        role: (session.user as any).role,
        jobTitle: (session.user as any).jobTitle,
        email: session.user.email || '',
        centerId: (session.user as any).centerId,
        centerName: (session.user as any).centerName,
        fullName: `${(session.user as any).firstName} ${(session.user as any).lastName}`
      };
      setCurrentUser(user);
    } else if (status === 'unauthenticated') {
      setCurrentUser(null);
    }
  }, [session, status]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
}
