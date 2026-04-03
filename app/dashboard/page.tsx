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
      if (hasRole(RoleName.ADMIN)) {
        router.push("/dashboard/admin/users");
      } else if (hasRole(RoleName.MENTOR)) {
        router.push("/dashboard/instructor/courses");
      } else {
        router.push("/dashboard/learner/courses");
      }
    }
  }, [user, hasRole, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
