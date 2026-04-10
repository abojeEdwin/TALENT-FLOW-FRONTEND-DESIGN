"use client";

import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchCourseById } from "@/lib/api/courses";
import { CourseResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await fetchCourseById(params.id);
        setCourse(data);
      } catch (error) {
        if (error instanceof APIError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load course");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCourse();
  }, [params.id]);

  if (isLoading) {
    return (
      <RoleGuard roles={["INTERN"]}>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </RoleGuard>
    );
  }

  if (!course) {
    return (
      <RoleGuard roles={["INTERN"]}>
        <EmptyState title="Course not found" description="This course does not exist." />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={["INTERN"]}>
      <div className="space-y-6">
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
                {course.level}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-2 text-gray-600">{course.description}</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">
                Level
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{course.level}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">
                Status
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{course.status}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">
                Created
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {course.tags && course.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {course.tags!.map((tag) => (
              <span key={tag} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
          </div>
        ) : null}

        <EmptyState
          title="Lessons coming soon"
          description="Lesson content and player will be available shortly"
        />

        <Link
          href="/dashboard/learner/courses"
          className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Courses
        </Link>
      </div>
    </RoleGuard>
  );
}
