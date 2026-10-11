"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useEffect } from "react";
import { RoleName } from "@/lib/api/types";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log('[Dashboard Redirect] User:', user);
      console.log('[Dashboard Redirect] User role:', user.role);
      console.log('[Dashboard Redirect] hasRole(ORG_ADMIN):', hasRole(RoleName.ORG_ADMIN));
      console.log('[Dashboard Redirect] hasRole(SUPER_ADMIN):', hasRole(RoleName.SUPER_ADMIN));
      console.log('[Dashboard Redirect] hasRole(INSTRUCTOR):', hasRole(RoleName.INSTRUCTOR));
      console.log('[Dashboard Redirect] hasRole(LEARNER):', hasRole(RoleName.LEARNER));
      
      if (hasRole(RoleName.ORG_ADMIN) || hasRole(RoleName.SUPER_ADMIN)) {
        console.log('[Dashboard Redirect] Redirecting to /dashboard/admin/users');
        router.push("/dashboard/admin/users");
      } else if (hasRole(RoleName.INSTRUCTOR)) {
        console.log('[Dashboard Redirect] Redirecting to /dashboard/instructor/courses');
        router.push("/dashboard/instructor/courses");
      } else {
        console.log('[Dashboard Redirect] Redirecting to /dashboard/learner/courses');
        router.push("/dashboard/learner/courses");
      }
    } else {
      console.log('[Dashboard Redirect] No user found, waiting...');
    }
  }, [user, hasRole, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
