"use client";

import { useEffect, useState, use } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchCourseDetail, enrollCourse, fetchCourseCoverImagePresignedUrl } from "@/lib/api/courses";
import { CourseDetailResponse, CourseResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, BookOpen, Clock, CheckCircle, Circle, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

function CourseDetailContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const courseId = params.id;
  
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await fetchCourseDetail(courseId);
        setCourse(data);
        
        if (data.coverImageUrl) {
          try {
            const { presignedUrl } = await fetchCourseCoverImagePresignedUrl(courseId);
            setCoverImageUrl(presignedUrl);
          } catch (err) {
            setCoverImageUrl(data.coverImageUrl || null);
          }
        }
        
        if (data.modules?.length) {
          setExpandedModules(new Set(data.modules.map((m: { id: string }) => m.id)));
        }
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
  }, [courseId]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await enrollCourse(courseId);
      const updatedCourse = await fetchCourseDetail(courseId);
      setCourse(updatedCourse);
      toast.success("Successfully enrolled in course!");
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to enroll in course");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isEnrolled = course?.progressPct != null && course.progressPct > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState 
        title="Course not found" 
        description="This course does not exist or is not available."
        action={{
          label: "Back to Courses",
          onClick: () => router.push("/dashboard/learner/courses"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link 
        href="/dashboard/learner/courses" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {coverImageUrl || course.coverImageUrl ? (
              <div className="aspect-video relative bg-black">
                <img 
                  src={coverImageUrl || course.coverImageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                {course.introVideoUrl && (
                  <a 
                    href={course.introVideoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <Play className="w-16 h-16 text-white" />
                  </a>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-secondary flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="mt-2 text-muted-foreground">{course.description}</p>
            </div>

            {course.modules && course.modules.length > 0 && (
              <div className="rounded-lg border border-border bg-card">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Course Content</h2>
                  <p className="text-sm text-muted-foreground">
                    {course.modules.length} module{course.modules.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {course.modules.map((module: { id: string; title: string; position: number; lessons: any[] }, index: number) => (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{module.title}</span>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      {expandedModules.has(module.id) && module.lessons && (
                        <div className="bg-muted/30 px-4 pb-4">
                          <div className="space-y-2 ml-11">
                            {module.lessons.map((lesson: { id: string; title: string; type: string; completed?: boolean }) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-background transition-colors"
                              >
                                {lesson.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="text-sm">{lesson.title}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {lesson.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6 sticky top-6">
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Enrolled</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Your Progress</span>
                    <span className="font-medium">{course.progressPct}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${course.progressPct || 0}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => router.push(`/dashboard/learner/courses/${courseId}/learn`)}>
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Click to start learning
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{course.status?.toLowerCase()}</span>
              </div>
              {course.modules && (
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{course.modules.length}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Level:</span>
                <span className="font-medium">All Levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <RoleGuard roles={["INTERN"]}>
      <CourseDetailContent paramsPromise={params} />
    </RoleGuard>
  );
}