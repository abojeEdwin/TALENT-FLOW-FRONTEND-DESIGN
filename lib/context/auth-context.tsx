"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthResponse } from "@/lib/api/types";
import { getCurrentUser, logoutUser, setAuthToken, getAuthToken } from "@/lib/api/auth";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthResponse | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = getAuthToken();
    console.log("[Auth] Bootstrap - token exists:", !!token);
    
    if (!token) {
      console.log("[Auth] No token, setting isLoading false");
      setIsLoading(false);
      return;
    }

    // Capture the token we're using - don't switch users if token changed
    const tokenAtStart = token;

    try {
      console.log("[Auth] Fetching current user...");
      const currentUser = await getCurrentUser();
      console.log("[Auth] User fetched successfully:", currentUser);
      
      // Only set user if token hasn't changed (another tab didn't login)
      if (getAuthToken() === tokenAtStart) {
        setUser(currentUser);
        console.log("[Auth] User set in context");
      } else {
        console.log("[Auth] Token changed during fetch, ignoring response");
      }
    } catch (error) {
      console.log("[Auth] Error fetching user:", error);
      // Check if token still exists - it might have been replaced by another tab
      const currentToken = getAuthToken();
      
      // Only clear if token hasn't changed (meaning our own token is invalid)
      // If token changed (another tab logged in), don't clear - that tab will handle it
      if (currentToken === tokenAtStart) {
        // Our token is invalid (401 from server) - clear session
        console.log("[Auth] Our token invalid, clearing session");
        setAuthToken(null);
        setUser(null);
      } else {
        console.log("[Auth] Token changed by another tab, ignoring");
        // Don't clear - let the other tab's event handle updating state
      }
    } finally {
      console.log("[Auth] fetchUser complete, setting isLoading false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for storage changes (login/logout in another tab)
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("[Auth] Storage changed, re-fetching user...");
      fetchUser();
    };
    
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore errors
    } finally {
      setAuthToken(null);
      setUser(null);
      window.location.href = "/auth/login";
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasRole,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
