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

    try {
      console.log("[Auth] Fetching current user...");
      const currentUser = await getCurrentUser();
      console.log("[Auth] User fetched:", currentUser);
      setUser(currentUser);
    } catch (error) {
      console.log("[Auth] Error fetching user, clearing token");
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for storage changes and custom auth events
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("[Auth] Token changed, re-fetching user...");
      fetchUser();
    };
    
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-token-change", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-token-change", handleAuthChange);
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
