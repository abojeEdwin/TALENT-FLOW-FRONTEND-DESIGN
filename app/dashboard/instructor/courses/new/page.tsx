'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseSchema, CreateCourseFormData } from '@/lib/schemas';
import { createCourse } from '@/lib/api/courses';
import { APIError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(CreateCourseSchema),
  });

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      setIsLoading(true);
      await createCourse({
        title: data.title,
        description: data.description,
      });
      toast.success('Course created successfully');
      router.push('/dashboard/instructor/courses');
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message || 'Failed to create course');
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create course';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Button */}
      <Link href="/dashboard/instructor/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
        <p className="text-muted-foreground">Set up the basic information for your course</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Provide essential details about your course
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced React Patterns"
                disabled={isLoading}
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course. Include learning objectives, prerequisites, and key topics."
                className="min-h-40"
                disabled={isLoading}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => router.push('/dashboard/instructor/courses')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Create basic course information (you are here)</li>
            <li>Add course content (lessons, videos, PDFs)</li>
            <li>Create assignments and quizzes</li>
            <li>Set course pricing and enrollment options</li>
            <li>Publish your course</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
