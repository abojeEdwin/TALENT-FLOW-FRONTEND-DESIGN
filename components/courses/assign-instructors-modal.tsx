"use client";

import { useState, useEffect } from "react";
import { UserResponse, CourseResponse } from "@/lib/api/types";
import { fetchInstructors, fetchUsers } from "@/lib/api/users";
import { assignInstructors } from "@/lib/api/courses";
import { APIError } from "@/lib/api/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { UserCheck, Loader2 } from "lucide-react";

interface AssignInstructorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseResponse;
  onSuccess?: () => void;
}

export function AssignInstructorsModal({
  open,
  onOpenChange,
  course,
  onSuccess,
}: AssignInstructorsModalProps) {
  const [instructors, setInstructors] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState<string>("");
  const [selectedInstructors, setSelectedInstructors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      loadInstructors();
      if (course.instructorIds?.length) {
        setSelectedInstructors(new Set(course.instructorIds));
        setSelectedPrimary(course.instructorIds[0] || "");
      }
      if (course.instructor?.id) {
        setSelectedPrimary(course.instructor.id);
      }
    }
  }, [open]);

  const loadInstructors = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInstructors();
      setInstructors(data);
    } catch (error) {
      console.error("Failed to load instructors:", error);
      toast.error("Failed to load instructors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleInstructor = (instructorId: string) => {
    const newSelected = new Set(selectedInstructors);
    if (newSelected.has(instructorId)) {
      newSelected.delete(instructorId);
    } else {
      newSelected.add(instructorId);
    }
    setSelectedInstructors(newSelected);
    
    if (selectedPrimary === instructorId && !newSelected.has(instructorId)) {
      setSelectedPrimary(newSelected.values().next().value || "");
    }
  };

  const handleSetPrimary = (instructorId: string) => {
    const newSelected = new Set(selectedInstructors);
    newSelected.add(instructorId);
    setSelectedInstructors(newSelected);
    setSelectedPrimary(instructorId);
  };

  const handleSubmit = async () => {
    if (!selectedPrimary) {
      toast.error("Please select a primary instructor");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignInstructors(course.id, {
        primaryInstructorId: selectedPrimary,
        coInstructorIds: Array.from(selectedInstructors),
      });
      toast.success("Instructors assigned successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to assign instructors");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Instructors</DialogTitle>
          <DialogDescription>
            Select instructors for "{course.title}". Choose one as the primary instructor.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : instructors.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No instructors found</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {instructors.map((instructor) => {
              const isSelected = selectedInstructors.has(instructor.id);
              const isPrimary = selectedPrimary === instructor.id;

              return (
                <div
                  key={instructor.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleInstructor(instructor.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {instructor.firstName} {instructor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {instructor.email}
                    </p>
                  </div>
                  <Button
                    variant={isPrimary ? "default" : "outline"}
                    size="sm"
                    disabled={!isSelected && !isPrimary}
                    onClick={() => handleSetPrimary(instructor.id)}
                  >
                    {isPrimary ? "Primary" : "Set Primary"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPrimary}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Instructors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}