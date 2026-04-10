"use client";

import { useState, useEffect } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { RoleName } from "@/lib/api/types";
import { fetchAdminCourses, publishCourse, unpublishCourse, archiveCourse } from "@/lib/api/courses";
import { CourseResponse } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, EyeOff, Archive, MoreVertical, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AssignInstructorsModal } from "@/components/courses/assign-instructors-modal";

function AdminCoursesContent() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response: CourseResponse[] = await fetchAdminCourses(filter);
      setCourses(response || []);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      }
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      await publishCourse(courseId);
      toast.success("Course published successfully");
      loadCourses();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      await unpublishCourse(courseId);
      toast.success("Course unpublished successfully");
      loadCourses();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      await archiveCourse(courseId);
      toast.success("Course archived successfully");
      loadCourses();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignInstructors = (course: CourseResponse) => {
    setSelectedCourse(course);
    setAssignModalOpen(true);
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Course Management</h1>
          <p className="text-muted-foreground">Manage course visibility and status</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(undefined)}
        >
          All
        </Button>
        <Button
          variant={filter === "DRAFT" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("DRAFT")}
        >
          Draft
        </Button>
        <Button
          variant={filter === "PUBLISHED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("PUBLISHED")}
        >
          Published
        </Button>
        <Button
          variant={filter === "ARCHIVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ARCHIVED")}
        >
          Archived
        </Button>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(course.status)}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3 line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {course.description || "No description"}
                </p>
                <div className="flex gap-2">
                  {course.status === "DRAFT" && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePublish(course.id)}
                      disabled={actionLoading === course.id}
                    >
                      {actionLoading === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      Publish
                    </Button>
                  )}
                  {course.status === "PUBLISHED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleUnpublish(course.id)}
                      disabled={actionLoading === course.id}
                    >
                      {actionLoading === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-1" />
                      )}
                      Unpublish
                    </Button>
                  )}
                  {course.status !== "ARCHIVED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleArchive(course.id)}
                      disabled={actionLoading === course.id}
                    >
                      {actionLoading === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Archive className="h-4 w-4 mr-1" />
                      )}
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignInstructors(course)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedCourse && (
        <AssignInstructorsModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          course={selectedCourse}
          onSuccess={() => {
            loadCourses();
          }}
        />
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <RoleGuard roles={[RoleName.ADMIN]}>
      <AdminCoursesContent />
    </RoleGuard>
  );
}