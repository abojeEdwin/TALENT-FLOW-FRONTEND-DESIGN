"use client";

import { useState, useEffect } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleName } from "@/lib/api/types";
import { fetchMyCourses } from "@/lib/api/courses";
import { CourseResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { Plus, BookOpen, Users, Video, TrendingUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

function InstructorDashboardContent() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response: CourseResponse[] = await fetchMyCourses();
        setCourses(response || []);
        setTotalCourses(response?.length || 0);
      } catch (error) {
        if (error instanceof APIError) {
          toast.error(error.message);
        }
        setCourses([]);
        setTotalCourses(0);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>
        <Link href="/dashboard/instructor/courses/new">
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
              <p className="text-2xl font-semibold text-foreground">{isLoading ? "-" : totalCourses}</p>
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
              <p className="text-2xl font-semibold text-foreground">-</p>
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
              <p className="text-2xl font-semibold text-foreground">-</p>
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
              <p className="text-2xl font-semibold text-foreground">-</p>
              <p className="text-sm text-muted-foreground">Avg. Completion</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="You haven't created any courses yet. Create your first course to get started."
          action={{
            label: "Create Course",
            onClick: () => window.location.href = "/dashboard/instructor/courses/new",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseResponse }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/dashboard/instructor/courses/${course.id}`}>
      <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {course.coverImageUrl && !imgError ? (
              <img 
                src={course.coverImageUrl} 
                alt={course.title}
                className="w-full h-full object-cover"
                onError={() => {
                  console.log("Image failed to load:", course.coverImageUrl);
                  setImgError(true);
                }}
              />
            ) : (
              <BookOpen className="w-5 h-5 text-primary" />
            )}
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <h3 className="mt-4 font-semibold text-foreground line-clamp-2">{course.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {course.description || "No description"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            course.status === "PUBLISHED" 
              ? "bg-green-100 text-green-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {course.status || "DRAFT"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function InstructorCoursesPage() {
  return (
    <RoleGuard roles={[RoleName.INSTRUCTOR]}>
      <InstructorDashboardContent />
    </RoleGuard>
  );
}