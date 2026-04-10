'use client';

import { useState, useRef } from 'react';
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
import { Loader2, ArrowLeft, Upload, X, FileVideo, Image } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [introVideo, setIntroVideo] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(CreateCourseSchema),
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const removeFile = (setFile: React.Dispatch<React.SetStateAction<File | null>>, inputRef: React.RefObject<HTMLInputElement | null>) => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      setIsLoading(true);
      await createCourse(
        {
          title: data.title,
          description: data.description,
        },
        coverImage || undefined,
        introVideo || undefined
      );
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
      <Link href="/dashboard/instructor/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

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

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image (Optional)</Label>
              <input
                type="file"
                ref={coverInputRef}
                onChange={(e) => handleFileChange(e, setCoverImage)}
                accept="image/*"
                className="hidden"
              />
              {coverImage ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{coverImage.name}</p>
                    <p className="text-xs text-muted-foreground">{(coverImage.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(setCoverImage, coverInputRef)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Cover Image
                </Button>
              )}
            </div>

            {/* Intro Video Upload */}
            <div className="space-y-2">
              <Label>Intro Video (Optional)</Label>
              <input
                type="file"
                ref={videoInputRef}
                onChange={(e) => handleFileChange(e, setIntroVideo)}
                accept="video/*"
                className="hidden"
              />
              {introVideo ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileVideo className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{introVideo.name}</p>
                    <p className="text-xs text-muted-foreground">{(introVideo.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(setIntroVideo, videoInputRef)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Intro Video
                </Button>
              )}
            </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Create basic course information (you are here)</li>
            <li>Add course content (lessons, videos, PDFs)</li>
            <li>Create assignments and quizzes</li>
            <li>Publish your course</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}