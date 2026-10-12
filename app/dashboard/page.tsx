"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useEffect } from "react";
import { RoleName } from "@/lib/api/types";

export default function DashboardPage() {
  const { user, hasRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (isLoading) {
      console.log('[Dashboard Redirect] Still loading user...');
      return;
    }

    // If no user after loading, redirect to login
    if (!user) {
      console.log('[Dashboard Redirect] No user found after loading, redirecting to login');
      router.push("/auth/login");
      return;
    }

    console.log('[Dashboard Redirect] User:', user);
    console.log('[Dashboard Redirect] User role:', user.role);
    console.log('[Dashboard Redirect] hasRole(ORG_ADMIN):', hasRole(RoleName.ORG_ADMIN));
    console.log('[Dashboard Redirect] hasRole(SUPER_ADMIN):', hasRole(RoleName.SUPER_ADMIN));
    console.log('[Dashboard Redirect] hasRole(INSTRUCTOR):', hasRole(RoleName.INSTRUCTOR));
    console.log('[Dashboard Redirect] hasRole(LEARNER):', hasRole(RoleName.LEARNER));
    
    if (hasRole(RoleName.ORG_ADMIN) || hasRole(RoleName.SUPER_ADMIN)) {
      console.log('[Dashboard Redirect] Redirecting to /dashboard/admin');
      router.push("/dashboard/admin");
    } else if (hasRole(RoleName.INSTRUCTOR)) {
      console.log('[Dashboard Redirect] Redirecting to /dashboard/instructor');
      router.push("/dashboard/instructor");
    } else if (hasRole(RoleName.LEARNER)) {
      console.log('[Dashboard Redirect] Redirecting to /dashboard/learner');
      router.push("/dashboard/learner");
    } else {
      console.log('[Dashboard Redirect] Unknown role, redirecting to learner');
      router.push("/dashboard/learner");
    }
  }, [user, hasRole, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
