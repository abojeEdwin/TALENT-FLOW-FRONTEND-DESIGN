'use client';

import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, TrendingUp, Award, Plus, ArrowRight } from 'lucide-react';
import { RoleGuard } from '@/components/shared/role-guard';
import { RoleName } from '@/lib/api/types';

// Mock data
const enrollmentData = [
  { name: 'Week 1', students: 45 },
  { name: 'Week 2', students: 62 },
  { name: 'Week 3', students: 78 },
  { name: 'Week 4', students: 95 },
];

const coursePerformance = [
  { name: 'React Advanced', completionRate: 78 },
  { name: 'Node.js Mastery', completionRate: 65 },
  { name: 'TypeScript 101', completionRate: 82 },
  { name: 'GraphQL APIs', completionRate: 71 },
];

const recentActivity = [
  {
    id: '1',
    course: 'Advanced React Patterns',
    event: 'New enrollment',
    user: 'Sarah Johnson',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    course: 'Node.js Masterclass',
    event: 'Assignment submitted',
    user: 'Mike Chen',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    course: 'TypeScript Complete',
    event: 'Course completed',
    user: 'Emily Davis',
    timestamp: '1 day ago',
  },
];

export default function InstructorDashboard() {
  const { user } = useAuth();

  return (
    <RoleGuard roles={[RoleName.INSTRUCTOR]}>
      <div className="space-y-8">
      {/* Welcome Section */}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">2 published, 2 drafts</p>
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
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-green-600 mt-1">+45 this month</p>
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
            <div className="text-2xl font-bold">74%</div>
            <p className="text-xs text-green-600 mt-1">+3% from last month</p>
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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">Issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/instructor/courses">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:pb-0 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    <span className="text-muted-foreground">{activity.user}</span> {activity.event}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.course}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
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
            <CardTitle className="text-base">Grade Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Review and grade pending student submissions</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/instructor/assignments">View Assignments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Student Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Analyze detailed student performance and progress</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/instructor/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
