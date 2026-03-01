/**
 * Session Context Provider
 *
 * Provides user authentication state to client-side components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '../auth-client';
import type { User } from 'lucia'; // We'll use a simplified type

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

/**
 * Hook to access session context
 */
export function useAuthSession() {
  return useContext(SessionContext);
}

/**
 * Session Provider Component
 * Wraps the app to provide authentication state to all components
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const user: SessionUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  } : null;

  // Sync user state with localStorage for reliable auth checks
  useEffect(() => {
    if (user) {
      // User is logged in - save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // User is logged out - remove from localStorage
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
