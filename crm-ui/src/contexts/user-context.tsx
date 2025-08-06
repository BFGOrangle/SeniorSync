"use client";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionUser = session.user as any;
      const user: CurrentUser = {
        id: parseInt(sessionUser.id),
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        role: sessionUser.role,
        jobTitle: sessionUser.jobTitle,
        email: sessionUser.email,
        fullName: `${sessionUser.firstName} ${sessionUser.lastName}`
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
