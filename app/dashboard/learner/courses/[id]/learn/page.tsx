"use client";

import { useEffect, useState, use, useCallback } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchCourseDetail, completeLesson } from "@/lib/api/courses";
import { CourseDetailResponse, CourseModuleResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, BookOpen, Clock, CheckCircle, Circle, ChevronDown, ChevronRight, GraduationCap, FileText, Video as VideoIcon, FileAudio, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  type: string;
  contentUrl?: string;
  contentText?: string;
  position: number;
  completed?: boolean;
}

function LessonViewerContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const courseId = params.id;
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get("lessonId");
  
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<(Lesson & { moduleTitle: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const router = useRouter();

  const loadCourse = useCallback(async () => {
    try {
      const data = await fetchCourseDetail(courseId);
      setCourse(data);
      
      if (data.modules?.length) {
        const expanded = new Set(data.modules.map((m) => m.id));
        setExpandedModules(expanded);
      }
      
      if (initialLessonId) {
        const lesson = findLesson(data, initialLessonId);
        if (lesson) {
          setCurrentLesson(lesson);
        }
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
  }, [courseId, initialLessonId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const findLesson = (courseData: CourseDetailResponse | null, lessonId: string): (Lesson & { moduleTitle: string }) | null => {
    if (!courseData?.modules) return null;
    for (const module of courseData.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === lessonId) {
          return { ...lesson, moduleTitle: module.title };
        }
      }
    }
    return null;
  };

  const handleSelectLesson = (lessonId: string) => {
    const lesson = findLesson(course, lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      router.push(`/dashboard/learner/courses/${courseId}/learn?lessonId=${lessonId}`, { scroll: false });
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setIsCompleting(true);
    try {
      await completeLesson(currentLesson.id);
      toast.success("Lesson completed!");
      
      const updatedCourse = await fetchCourseDetail(courseId);
      setCourse(updatedCourse);
      
      const nextLesson = getNextLesson(currentLesson.id);
      if (nextLesson) {
        setCurrentLesson({ ...nextLesson, moduleTitle: findModuleTitle(nextLesson.id) });
        router.push(`/dashboard/learner/courses/${courseId}/learn?lessonId=${nextLesson.id}`, { scroll: false });
      } else {
        toast.success("Course completed!");
      }
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to mark lesson as complete");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const findModuleTitle = (lessonId: string): string => {
    if (!course?.modules) return "";
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === lessonId) {
          return module.title;
        }
      }
    }
    return "";
  };

  const getAllLessons = (): (Lesson & { moduleTitle: string })[] => {
    if (!course?.modules) return [];
    const lessons: (Lesson & { moduleTitle: string })[] = [];
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        lessons.push({ ...lesson, moduleTitle: module.title });
      }
    }
    return lessons;
  };

  const getNextLesson = (currentLessonId: string): any | null => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  const getPrevLesson = (currentLessonId: string): any | null => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }
    return null;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

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

  const allLessons = getAllLessons();
  const currentIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-80 flex-shrink-0">
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <Link 
              href={`/dashboard/learner/courses/${courseId}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>
            <h2 className="font-semibold truncate">{course.title}</h2>
          </div>
          <div className="divide-y divide-border max-h-[calc(100vh-300px)] overflow-y-auto">
            {course.modules?.map((module: any) => (
              <div key={module.id}>
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium text-sm">{module.title}</span>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {expandedModules.has(module.id) && module.lessons && (
                  <div className="bg-muted/30 px-2 pb-2">
                    {module.lessons.map((lesson: any) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm ${
                          currentLesson?.id === lesson.id 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-background"
                        }`}
                      >
                        {lesson.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {!currentLesson ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Select a lesson</h2>
            <p className="text-muted-foreground">Choose a lesson from the sidebar to start learning</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {currentLesson.type === 'VIDEO' && currentLesson.contentUrl ? (
                <div className="aspect-video bg-black">
                  <video 
                    src={currentLesson.contentUrl} 
                    controls 
                    className="w-full h-full"
                  />
                </div>
              ) : currentLesson.type === 'PDF' && currentLesson.contentUrl ? (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <iframe 
                    src={currentLesson.contentUrl} 
                    className="w-full h-full"
                    title={currentLesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{currentLesson.moduleTitle}</p>
                  <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                </div>
                {currentLesson.completed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  disabled={!getPrevLesson(currentLesson.id)}
                  onClick={() => handleSelectLesson(getPrevLesson(currentLesson.id).id)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {!currentLesson.completed ? (
                  <Button 
                    onClick={handleMarkComplete}
                    disabled={isCompleting}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isCompleting ? "Completing..." : "Mark Complete"}
                  </Button>
                ) : getNextLesson(currentLesson.id) ? (
                  <Button 
                    onClick={() => handleSelectLesson(getNextLesson(currentLesson.id).id)}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push(`/dashboard/learner/courses/${courseId}`)}
                  >
                    Finish Course
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LessonViewerPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <RoleGuard roles={["INTERN"]}>
      <LessonViewerContent paramsPromise={params} />
    </RoleGuard>
  );
}