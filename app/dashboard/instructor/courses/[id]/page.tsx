"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";

export default function CourseEditPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard roles={["MENTOR"]}>
      <div className="space-y-6">
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900"
        >
          ← Back to Courses
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Editor</h1>
          <p className="mt-2 text-gray-600">Manage course content and settings</p>
        </div>

        <EmptyState
          title="Course editor coming soon"
          description="Advanced course editing and management features will be available shortly"
        />
      </div>
    </RoleGuard>
  );
}
