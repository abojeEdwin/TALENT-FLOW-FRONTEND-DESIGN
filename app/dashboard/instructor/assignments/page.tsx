"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Calendar, FileText, Trash2, Edit, Eye } from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import * as assignmentApi from "@/lib/api/assignments";
import { AssignmentResponse } from "@/lib/api/types";
import { CreateAssignmentDialog } from "@/components/assignments/create-assignment-dialog";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await assignmentApi.getAssignments({ page: 0, size: 50 });
      setAssignments(response.content);
    } catch (error: any) {
      console.error("Failed to fetch assignments:", error);
      
      // Check if it's a backend error
      if (error.status === 500) {
        toast.error("Backend error: The assignments endpoint is not available yet. Please check your backend server.");
      } else if (error.status === 404) {
        toast.error("Assignments endpoint not found. Please verify your backend API.");
      } else {
        toast.error("Failed to load assignments");
      }
      
      // Set empty array so the UI doesn't break
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await assignmentApi.deleteAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  const handleEdit = (assignment: AssignmentResponse) => {
    setSelectedAssignment(assignment);
    setShowCreateDialog(true);
  };

  const handleView = (assignmentId: string) => {
    router.push(`/dashboard/instructor/assignments/${assignmentId}`);
  };

  const handleAssignmentCreated = () => {
    setShowCreateDialog(false);
    setSelectedAssignment(null);
    fetchAssignments();
  };

  if (isLoading) {
    return (
      <RoleGuard roles={["INSTRUCTOR"]}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="mt-2 text-muted-foreground">
              Create and manage course assignments
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments created"
            description="Create assignments to engage your students and assess their learning"
            action={{
              label: "Create Your First Assignment",
              onClick: () => setShowCreateDialog(true),
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => {
              const dueDate = assignment.dueAt ? new Date(assignment.dueAt) : null;
              const isOverdue = dueDate !== null && isPast(dueDate);

              return (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {assignment.instructions}
                        </CardDescription>
                      </div>
                      <Badge variant={isOverdue ? "destructive" : "default"}>
                        {isOverdue ? "Overdue" : "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Due: {dueDate ? format(dueDate, "MMM d, yyyy") : "Not set"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleView(assignment.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CreateAssignmentDialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onSuccess={handleAssignmentCreated}
        />
      </div>
    </RoleGuard>
  );
}
