"use client";

import { useState, useEffect } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Award, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as assignmentApi from "@/lib/api/assignments";
import * as courseApi from "@/lib/api/courses";
import { InstructorProgressResponse } from "@/lib/api/types";
import { CourseResponse } from "@/lib/api/types";

export default function ProgressPage() {
  const [learners, setLearners] = useState<InstructorProgressResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const coursesData = await courseApi.fetchInstructorCourses();
      // Ensure we always have an array
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]); // Set empty array on error
    }
  };

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const courseId = selectedCourse === "all" ? undefined : selectedCourse;
      const response = await assignmentApi.getInstructorProgress({ courseId, page: 0, size: 100 });
      setLearners(response.content);
    } catch (error: any) {
      console.error("Failed to fetch learner progress:", error);
      
      // Check if it's a backend error
      if (error.status === 500) {
        toast.error("Backend error: The progress endpoint is not available yet. Please check your backend server.");
      } else if (error.status === 404) {
        toast.error("Progress endpoint not found. Please verify your backend API.");
      } else {
        toast.error("Failed to load learner progress");
      }
      
      // Set empty array so the UI doesn't break
      setLearners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const averageProgress = learners.length > 0
    ? learners.reduce((sum, l) => sum + l.progressPct, 0) / learners.length
    : 0;

  const averageGrade = learners.filter(l => l.averageScore != null).length > 0
    ? learners
        .filter(l => l.averageScore != null)
        .reduce((sum, l) => sum + (l.averageScore ?? 0), 0) /
      learners.filter(l => l.averageScore != null).length
    : 0;

  const totalAssignmentsSubmitted = learners.reduce((sum, l) => sum + l.submittedAssignments, 0);
  const totalAssignments = learners.reduce((sum, l) => sum + l.totalAssignments, 0);

  if (isLoading) {
    return (
      <RoleGuard roles={["INSTRUCTOR"]}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Learner Progress</h1>
            <p className="mt-2 text-muted-foreground">
              Monitor student progress and performance
            </p>
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
              <Progress value={averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all graded assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learners.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active in selected course(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAssignmentsSubmitted}/{totalAssignments}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Submitted / Total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Learner Details</CardTitle>
          </CardHeader>
          <CardContent>
            {learners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No learners found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {learners.map((learner, index) => (
                  <div
                    key={learner.learnerId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {learner.learnerName?.charAt(0).toUpperCase() ?? ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{learner.learnerName}</p>
                          <Badge variant="outline" className="text-xs">
                            {learner.learnerEmail}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {learner.courseTitle}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                          </span>
                          <span>
                            Assignments: {learner.submittedAssignments}/{learner.totalAssignments}
                          </span>
                          <span>
                            Enrolled: {learner.enrollmentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {learner.averageScore != null && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Avg Grade</p>
                          <p className="text-lg font-bold">{learner.averageScore != null ? learner.averageScore.toFixed(1) : "N/A"}</p>
                        </div>
                      )}
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{learner.progressPct?.toFixed(0) ?? "0"}%</span>
                        </div>
                        <Progress value={learner.progressPct} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
