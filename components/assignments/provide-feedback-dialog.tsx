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
import { toast } from "sonner";
import * as assignmentApi from "@/lib/api/assignments";
import { AssignmentSubmissionResponse } from "@/lib/api/types";

const feedbackSchema = z.object({
  grade: z.number().min(0, "Grade must be at least 0").max(100, "Grade cannot exceed 100"),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface ProvideFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: AssignmentSubmissionResponse;
  assignmentId: string;
  onSuccess: () => void;
}

export function ProvideFeedbackDialog({
  open,
  onOpenChange,
  submission,
  assignmentId,
  onSuccess,
}: ProvideFeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      grade: submission.grade || 0,
      feedback: submission.feedback || "",
    },
  });

  useEffect(() => {
    if (open) {
      setValue("grade", submission.grade || 0);
      setValue("feedback", submission.feedback || "");
    }
  }, [open, submission, setValue]);

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);

      await assignmentApi.provideFeedback(assignmentId, submission.id, {
        grade: data.grade,
        feedback: data.feedback,
      });

      toast.success("Feedback provided successfully");
      onSuccess();
      reset();
    } catch (error: any) {
      console.error("Failed to provide feedback:", error);
      toast.error(error.message || "Failed to provide feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {submission.grade !== undefined ? "Update Feedback" : "Provide Feedback"}
          </DialogTitle>
          <DialogDescription>
            Grade the submission and provide constructive feedback to the student
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Student:</p>
          <p className="text-sm">{submission.user}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
          <Button
            variant="link"
            className="p-0 h-auto mt-2"
            onClick={() => window.open(submission.fileUrl, "_blank")}
          >
            View Submission
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Grade (0-100) *</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register("grade", { valueAsNumber: true })}
              placeholder="e.g., 85"
              disabled={isSubmitting}
            />
            {errors.grade && (
              <p className="text-sm text-destructive">{errors.grade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback *</Label>
            <Textarea
              id="feedback"
              {...register("feedback")}
              placeholder="Provide detailed feedback on the student's work..."
              rows={6}
              disabled={isSubmitting}
            />
            {errors.feedback && (
              <p className="text-sm text-destructive">{errors.feedback.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Be specific and constructive. Highlight what was done well and areas for improvement.
            </p>
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
                ? "Submitting..."
                : submission.grade !== undefined
                ? "Update Feedback"
                : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
