"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminInstructorsPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
          <p className="mt-2 text-gray-600">Manage instructor onboarding and profiles</p>
        </div>

        <EmptyState
          title="Coming soon"
          description="Instructor onboarding and management features will be available shortly"
        />
      </div>
    </RoleGuard>
  );
}
