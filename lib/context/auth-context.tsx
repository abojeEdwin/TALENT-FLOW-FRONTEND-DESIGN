"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AuthResponse } from "@/lib/api/types";
import { getCurrentUser, logoutUser, setAuthToken, getAuthToken } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken();
    tokenRef.current = token;
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    const tokenAtStart = token;

    try {
      const currentUser = await getCurrentUser();
      
      if (getAuthToken() === tokenAtStart) {
        setUser(currentUser);
      }
    } catch {
      const currentToken = getAuthToken();
      
      if (currentToken === tokenAtStart) {
        setAuthToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleAuthChange = () => {
      if (getAuthToken() !== tokenRef.current) {
        fetchUser();
      }
    };
    
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [fetchUser]);

  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user?.role]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore errors
    } finally {
      setAuthToken(null);
      setUser(null);
      router.push("/auth/login");
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    logout,
    refreshUser,
    setUser,
  }), [user, isLoading, hasRole, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
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
