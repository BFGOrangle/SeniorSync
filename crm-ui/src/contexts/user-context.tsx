"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace this with actual authentication logic
    // For now, we'll simulate a logged-in user
    const mockUser: CurrentUser = {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'Care Coordinator',
      fullName: 'Sarah Johnson'
    };

    // Simulate loading delay
    setTimeout(() => {
      setCurrentUser(mockUser);
      setIsLoading(false);
    }, 100);
  }, []);

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
