"use client";

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { RoleName } from '@/lib/api/types';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (hasRole(RoleName.ADMIN)) {
        router.push("/dashboard/admin/users");
      } else if (hasRole(RoleName.INSTRUCTOR)) {
        router.push("/dashboard/instructor/courses");
      } else {
        router.push("/dashboard/learner/courses");
      }
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
