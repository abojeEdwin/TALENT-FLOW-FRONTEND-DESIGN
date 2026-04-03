'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data
const enrollmentTrend = [
  { date: '2024-02-01', enrollments: 10 },
  { date: '2024-02-08', enrollments: 25 },
  { date: '2024-02-15', enrollments: 45 },
  { date: '2024-02-22', enrollments: 78 },
  { date: '2024-03-01', enrollments: 120 },
  { date: '2024-03-08', enrollments: 156 },
  { date: '2024-03-15', enrollments: 189 },
];

const courseCompletion = [
  { course: 'React Advanced', completionRate: 78, students: 245 },
  { course: 'Node.js Master', completionRate: 65, students: 189 },
  { course: 'TypeScript 101', completionRate: 82, students: 312 },
  { course: 'GraphQL APIs', completionRate: 71, students: 156 },
];

const studentProgress = [
  { lessonNumber: 1, averageScore: 85 },
  { lessonNumber: 2, averageScore: 82 },
  { lessonNumber: 3, averageScore: 78 },
  { lessonNumber: 4, averageScore: 75 },
  { lessonNumber: 5, averageScore: 72 },
  { lessonNumber: 6, averageScore: 68 },
  { lessonNumber: 7, averageScore: 70 },
];

const topPerformers = [
  { name: 'Sarah Johnson', averageScore: 95, coursesCompleted: 2 },
  { name: 'Mike Chen', averageScore: 92, coursesCompleted: 3 },
  { name: 'Emily Davis', averageScore: 89, coursesCompleted: 1 },
  { name: 'David Wilson', averageScore: 87, coursesCompleted: 2 },
  { name: 'Jessica Lee', averageScore: 85, coursesCompleted: 2 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your students' performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74%</div>
            <p className="text-xs text-green-600 mt-1">Above industry average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Student Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">612</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="topstudents">Top Students</TabsTrigger>
        </TabsList>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completion Tab */}
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Course Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={courseCompletion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill="hsl(var(--primary))" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={studentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lessonNumber" label={{ value: 'Lesson Number', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="averageScore" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Students Tab */}
        <TabsContent value="topstudents">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.coursesCompleted} course{student.coursesCompleted !== 1 ? 's' : ''} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{student.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">Average Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
