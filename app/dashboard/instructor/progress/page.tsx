"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";

export default function InstructorProgressPage() {
  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
          <p className="mt-2 text-gray-600">Track student progress across your courses</p>
        </div>

        <EmptyState
          title="No data available"
          description="Student progress data will appear here as students enroll in your courses"
        />
      </div>
    </RoleGuard>
  );
}
