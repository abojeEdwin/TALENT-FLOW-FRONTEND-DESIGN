'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, TrendingUp, Award, Plus } from 'lucide-react';
import { RoleGuard } from '@/components/shared/role-guard';
import { RoleName } from '@/lib/api/types';
import { fetchInstructorCourses } from '@/lib/api/courses';
import { CourseListResponse, CourseResponse } from '@/lib/api/types';
import { APIError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response: CourseResponse[] = await fetchInstructorCourses();
        setCourses(response || []);
      } catch (error) {
        if (error instanceof APIError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const draftCount = courses.filter(c => c.status !== 'PUBLISHED').length;

  return (
    <RoleGuard roles={[RoleName.INSTRUCTOR]}>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/instructor/courses/new">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {publishedCount} published, {draftCount} drafts
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg. Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No courses yet. Create your first course!</p>
              ) : (
                <div className="space-y-2">
                  {courses.slice(0, 5).map(course => (
                    <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium truncate">{course.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status || 'DRAFT'}
                      </span>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <Link href="/dashboard/instructor/courses" className="text-sm text-primary hover:underline">
                      View all {courses.length} courses
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No courses to display</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courses.slice(0, 4).map(c => ({ name: c.title?.substring(0, 15) || 'Untitled', completionRate: 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/instructor/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map(course => (
                  <div key={course.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {course.status || 'DRAFT'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Build and publish a new course for your students</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/instructor/courses/new">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Upload and manage course materials</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/instructor/materials">View Materials</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Course Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Analyze detailed student performance</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/instructor/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}