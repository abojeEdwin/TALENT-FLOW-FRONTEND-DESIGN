"use client";

import { useEffect, useState } from "react";
import { fetchPublishedCoursesWithCoverImages } from "@/lib/api/courses";
import { RoleGuard } from "@/components/shared/role-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { CourseResponse, RoleName } from "@/lib/api/types";
import { COURSE_LEVELS } from "@/lib/utils/constants";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import { Search, Filter, BookOpen, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

function BrowseCoursesContent() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPublishedCoursesWithCoverImages(
        page,
        pageSize,
        selectedLevel || undefined,
        undefined
      );
      setCourses(response);
      setTotalPages(Math.ceil(response.length / pageSize));
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load courses");
      }
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [page, pageSize, selectedLevel]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-blue-100 text-blue-700";
      case "Advanced":
        return "bg-purple-100 text-purple-700";
      case "Expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Browse Courses</h1>
        <p className="text-muted-foreground">Discover courses to advance your skills</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            setPage(0);
          }}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">All Levels</option>
          {COURSE_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card animate-pulse">
              <div className="h-40 bg-secondary" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-secondary rounded w-1/3" />
                <div className="h-6 bg-secondary rounded w-3/4" />
                <div className="h-12 bg-secondary rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="No published courses available yet."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSelectedLevel("");
              setSearchQuery("");
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/dashboard/learner/courses/${course.id}`} className="block">
              <div className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors h-full">
                <div className="h-40 bg-secondary flex items-center justify-center relative overflow-hidden">
                  {course.coverImageUrl ? (
                    <Image 
                      src={course.coverImageUrl} 
                      alt={course.title} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  )}
                  {course.introVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelBadgeClass(course.level || "")}`}>
                      {course.level || "All Levels"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {course.duration || 0}h
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LearnerCoursesPage() {
  return (
    <RoleGuard roles={[RoleName.INTERN]}>
      <BrowseCoursesContent />
    </RoleGuard>
  );
}
