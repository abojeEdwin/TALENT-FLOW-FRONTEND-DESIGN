"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";

export default function InstructorMaterialsPage() {
  return (
    <RoleGuard roles={["MENTOR"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="mt-2 text-gray-600">Upload and manage course materials</p>
        </div>

        <EmptyState
          title="No materials uploaded"
          description="Upload course materials to get started"
        />
      </div>
    </RoleGuard>
  );
}
