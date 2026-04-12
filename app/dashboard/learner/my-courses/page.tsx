"use client";

import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchLearnerCourses, fetchCourseCoverImagePresignedUrl } from "@/lib/api/courses";
import { CourseResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function MyCoursesContent() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchLearnerCourses();
        
        const coursesWithImages = await Promise.all(
          data.map(async (course) => {
            try {
              const { presignedUrl } = await fetchCourseCoverImagePresignedUrl(course.id);
              return { ...course, coverImageUrl: presignedUrl };
            } catch (err) {
              return course;
            }
          })
        );
        
        setCourses(coursesWithImages);
      } catch (error) {
        if (error instanceof APIError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load your courses");
        }
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>
        <EmptyState
          title="No enrolled courses"
          description="You haven&apos;t enrolled in any courses yet. Browse our catalog to start learning."
          action={{
            label: "Browse Courses",
            onClick: () => window.location.href = "/dashboard/learner/courses",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/dashboard/learner/courses/${course.id}`} className="block">
            <div className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors h-full flex flex-col">
              <div className="h-40 bg-secondary flex items-center justify-center relative flex-shrink-0">
                {course.coverImageUrl ? (
                  <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Enrolled
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{course.description}</p>
                <Button className="w-full mt-auto" variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Button variant="link" onClick={() => window.location.href = "/dashboard/learner/courses"}>
          Browse more courses
        </Button>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  return (
    <RoleGuard roles={["INTERN"]}>
      <MyCoursesContent />
    </RoleGuard>
  );
}