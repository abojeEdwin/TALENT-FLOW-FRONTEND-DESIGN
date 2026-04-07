"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  roles,
  children,
  fallback = <div className="p-6 text-center text-destructive">Access Denied</div>,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
}
