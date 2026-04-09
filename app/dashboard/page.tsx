"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useEffect } from "react";
import { RoleName } from "@/lib/api/types";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  console.log("[DashboardPage] Rendering, user:", user, "hasRole(INSTRUCTOR):", hasRole(RoleName.INSTRUCTOR));

  useEffect(() => {
    console.log("[DashboardPage] useEffect triggered, user:", user);
    if (user) {
      console.log("[DashboardPage] User role:", user.role, "hasRole(INSTRUCTOR):", hasRole(RoleName.INSTRUCTOR));
      if (hasRole(RoleName.ADMIN)) {
        router.push("/dashboard/admin/users");
      } else if (hasRole(RoleName.INSTRUCTOR)) {
        router.push("/dashboard/instructor/courses");
      } else {
        router.push("/dashboard/learner/courses");
      }
    } else {
      console.log("[DashboardPage] No user yet");
    }
  }, [user, hasRole, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
