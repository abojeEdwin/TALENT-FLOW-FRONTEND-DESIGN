"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import * as assignmentApi from "@/lib/api/assignments";
import * as courseApi from "@/lib/api/courses";
import { AssignmentResponse, CourseResponse } from "@/lib/api/types";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  course: z.string().min(1, "Course is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: AssignmentResponse | null;
  onSuccess: () => void;
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSuccess,
}: CreateAssignmentDialogProps) {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      course: "",
      dueDate: "",
    },
  });

  const selectedCourse = watch("course");

  useEffect(() => {
    if (open) {
      fetchCourses();
      if (assignment) {
        // Populate form with existing assignment data
        setValue("title", assignment.title);
        setValue("description", assignment.description);
        setValue("course", assignment.course);
        // Convert ISO date to datetime-local format
        const dueDate = new Date(assignment.dueDate);
        const localDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setValue("dueDate", localDate);
      } else {
        reset();
      }
    }
  }, [open, assignment, setValue, reset]);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const coursesData = await courseApi.fetchInstructorCourses();
      // Ensure we always have an array
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
      setCourses([]); // Set empty array on error
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert local datetime to ISO string
      const dueDate = new Date(data.dueDate).toISOString();

      if (assignment) {
        // Update existing assignment
        await assignmentApi.updateAssignment(assignment.id, {
          ...data,
          dueDate,
        });
        toast.success("Assignment updated successfully");
      } else {
        // Create new assignment
        await assignmentApi.createAssignment({
          ...data,
          dueDate,
        });
        toast.success("Assignment created successfully");
      }

      onSuccess();
      reset();
    } catch (error: any) {
      console.error("Failed to save assignment:", error);
      toast.error(error.message || "Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Create New Assignment"}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? "Update the assignment details below"
              : "Fill in the details to create a new assignment for your students"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Week 1 Assignment"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe what students need to do..."
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select
              value={selectedCourse}
              onValueChange={(value) => setValue("course", value)}
              disabled={isSubmitting || isLoadingCourses}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course && (
              <p className="text-sm text-destructive">{errors.course.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              {...register("dueDate")}
              disabled={isSubmitting}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? assignment
                  ? "Updating..."
                  : "Creating..."
                : assignment
                ? "Update Assignment"
                : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
