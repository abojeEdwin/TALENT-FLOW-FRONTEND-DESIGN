"use client";

import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleName } from "@/lib/api/types";
import { Plus, BookOpen, Users, Video, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function InstructorDashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>
        <Link href="/dashboard/instructor/courses/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Video Lessons</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">0%</p>
              <p className="text-sm text-muted-foreground">Avg. Completion</p>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        title="No courses yet"
        description="You haven&apos;t created any courses yet. Create your first course to get started."
        action={{
          label: "Create Course",
          onClick: () => {},
        }}
      />
    </div>
  );
}

export default function InstructorCoursesPage() {
  return (
    <RoleGuard roles={[RoleName.MENTOR]}>
      <InstructorDashboardContent />
    </RoleGuard>
  );
}
