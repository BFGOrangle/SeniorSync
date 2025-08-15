"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Hub } from "@aws-amplify/core";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut } from "aws-amplify/auth";

// Keep your existing CurrentUser interface for backward compatibility
export interface CurrentUser {
  id: string;
  firstName?: string;
  lastName?: string;
  role: string;
  jobTitle?: string;
  email?: string;
  fullName: string;
}

interface UserContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = async () => {
    setIsLoading(true);
    try {
      const session = await fetchAuthSession();
      if (!session.tokens) {
        setCurrentUser(null);
        return;
      }

      // Get user details and attributes
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      // Extract user ID and role from token
      let userId = "";
      let userRole = 'STAFF'; // Default role
      
      try {
        const token = session.tokens.idToken;
        if (token) {
          const payload = token.toString().split('.')[1];
          const decodedClaims = JSON.parse(atob(payload));
          userId = decodedClaims['custom:id'] || decodedClaims.sub || "";
          
          // Extract role from Cognito groups first (this is where your ADMIN role is)
          const cognitoGroups = decodedClaims['cognito:groups'];
          if (cognitoGroups && Array.isArray(cognitoGroups) && cognitoGroups.length > 0) {
            userRole = cognitoGroups[0].toUpperCase(); // Use first group as primary role
          } else {
            // Fallback to custom role attribute if no groups
            userRole = decodedClaims['custom:role'] || 'STAFF';
          }
          
          console.log('Extracted role from token:', userRole, 'from groups:', cognitoGroups);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }

      // Map to your existing CurrentUser format
      const user: CurrentUser = {
        id: userId,
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        role: userRole, // Use the role extracted from token
        jobTitle: attributes['custom:job_title'] || attributes.job_title,
        email: attributes.email,
        fullName: attributes.name || `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim()
      };

      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial user fetch
    updateUser();

    // Listen for auth events
    const unsubscribe = Hub.listen("auth", ({ payload: { event } }) => {
      if (event === "signedIn" || event === "tokenRefresh") {
        updateUser();
      } else if (event === "signedOut") {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Hub listener will handle setting currentUser to null
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Dummy setCurrentUser for compatibility (Amplify manages state)
  const handleSetCurrentUser = (user: CurrentUser | null) => {
    console.warn('setCurrentUser called but user state is managed by Amplify');
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isStaff = currentUser?.role === 'STAFF';

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser: handleSetCurrentUser, 
      isLoading,
      isAdmin,
      isStaff,
      signOut: handleSignOut
    }}>
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
