"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { RoleName } from "@/lib/api/types";

export default function MyCoursesPage() {
  return (
    <RoleGuard roles={[RoleName.INTERN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">View your enrolled courses and progress</p>
        </div>

        <EmptyState
          title="No enrolled courses"
          description="You haven&apos;t enrolled in any courses yet. Browse courses to get started."
          action={{
            label: "Browse Courses",
            onClick: () => (window.location.href = "/dashboard/learner/courses"),
          }}
        />
      </div>
    </RoleGuard>
  );
}
