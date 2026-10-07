"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, FileText, Download, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as assignmentApi from "@/lib/api/assignments";
import { AssignmentResponse, AssignmentSubmissionResponse } from "@/lib/api/types";
import { ProvideFeedbackDialog } from "@/components/assignments/provide-feedback-dialog";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // The backend has no endpoint to list submissions for an assignment, so this
  // stays empty until that endpoint exists.
  const [submissions] = useState<AssignmentSubmissionResponse[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmissionResponse | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setIsLoading(true);
      // The backend has no "list submissions for an assignment" endpoint, so
      // only the assignment itself can be loaded here.
      const assignmentData = await assignmentApi.getAssignment(assignmentId);
      setAssignment(assignmentData);
    } catch (error) {
      console.error("Failed to fetch assignment details:", error);
      toast.error("Failed to load assignment details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvideFeedback = (submission: AssignmentSubmissionResponse) => {
    setSelectedSubmission(submission);
    setShowFeedbackDialog(true);
  };

  const handleFeedbackProvided = () => {
    setShowFeedbackDialog(false);
    setSelectedSubmission(null);
    fetchAssignmentDetails();
  };

  if (isLoading) {
    return (
      <RoleGuard roles={["INSTRUCTOR"]}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </RoleGuard>
    );
  }

  if (!assignment) {
    return (
      <RoleGuard roles={["INSTRUCTOR"]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Assignment not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </RoleGuard>
    );
  }

  const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
  const pendingSubmissions = submissions.filter(s => s.grade === undefined || s.grade === null);
  const averageGrade = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
    : 0;

  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground mt-1">{assignment.instructions}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradedSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Due Date:</span>
              <span className="ml-2 font-medium">
                {assignment.dueAt ? format(new Date(assignment.dueAt), "MMMM d, yyyy 'at' h:mm a") : "No due date"}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {format(new Date(assignment.createdByUserId), "MMMM d, yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Submissions ({submissions.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <SubmissionsList
              submissions={submissions}
              onProvideFeedback={handleProvideFeedback}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <SubmissionsList
              submissions={pendingSubmissions}
              onProvideFeedback={handleProvideFeedback}
            />
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            <SubmissionsList
              submissions={gradedSubmissions}
              onProvideFeedback={handleProvideFeedback}
            />
          </TabsContent>
        </Tabs>

        {selectedSubmission && (
          <ProvideFeedbackDialog
            open={showFeedbackDialog}
            onOpenChange={setShowFeedbackDialog}
            submission={selectedSubmission}
            assignmentId={assignmentId}
            onSuccess={handleFeedbackProvided}
          />
        )}
      </div>
    </RoleGuard>
  );
}

interface SubmissionsListProps {
  submissions: AssignmentSubmissionResponse[];
  onProvideFeedback: (submission: AssignmentSubmissionResponse) => void;
}

function SubmissionsList({ submissions, onProvideFeedback }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Avatar>
                  <AvatarFallback>
                    {submission.learnerName?.charAt(0).toUpperCase() ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-medium">{submission.learnerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a") : "-"}
                    </p>
                  </div>
                  {submission.feedback && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Feedback:</p>
                      <p className="text-sm">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {submission.grade !== undefined && submission.grade !== null && (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {submission.grade}%
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!submission.submissionFileUrl}
                  onClick={() => window.open(submission.submissionFileUrl ?? "", "_blank")}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onProvideFeedback(submission)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {submission.grade !== undefined ? "Update" : "Grade"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
