"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { RoleName } from "@/lib/api/types";

interface RoleGuardProps {
  roles: (RoleName | string)[];
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

  if (!user || !user.roles?.some((role) => roles.includes(role))) {
    return fallback;
  }

  return <>{children}</>;
}
