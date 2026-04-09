"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";

export default function AssignmentsPage() {
  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-gray-600">Create and manage course assignments</p>
        </div>

        <EmptyState
          title="No assignments created"
          description="Create assignments to engage your students"
        />
      </div>
    </RoleGuard>
  );
}
