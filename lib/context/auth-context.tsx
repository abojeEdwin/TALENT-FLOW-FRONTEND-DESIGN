"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthResponse, RoleName } from "@/lib/api/types";
import { getCurrentUser, logoutUser } from "@/lib/api/auth";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: RoleName) => boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentUser = await getCurrentUser();
        // Backend returns role as a single string, convert to array for frontend
        if (currentUser.role && !currentUser.roles) {
          currentUser.roles = [currentUser.role];
        }
        setUser(currentUser);
      } catch (error) {
        // Network errors are expected when backend is not available
        // The app can still function without auth initially
        console.log("[v0] Not authenticated or backend unavailable");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const hasRole = (role: RoleName) => {
    return user?.roles?.includes(role) ?? false;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore 401 errors - user wants to log out anyway
    } finally {
      setUser(null);
      window.location.href = "/auth/login";
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      // Backend returns role as a single string, convert to array for frontend
      if (currentUser.role && !currentUser.roles) {
        currentUser.roles = [currentUser.role];
      }
      setUser(currentUser);
    } catch (error) {
      console.error("[v0] Refresh user error:", error);
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
