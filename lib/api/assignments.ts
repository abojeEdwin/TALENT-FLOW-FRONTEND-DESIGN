import { fetchAPI } from "./client";
import {
  AssignmentResponse,
  CreateAssignmentRequest,
  AssignmentSubmissionResponse,
} from "./types";

// Assignment Management

export interface AssignmentListResponse {
  content: AssignmentResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface SubmissionListResponse {
  content: AssignmentSubmissionResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ProvideFeedbackRequest {
  feedback: string;
  grade?: number;
}

export interface LearnerProgressResponse {
  userId: string;
  userName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  averageGrade?: number;
  lastAccessedAt: string;
}

// Create Assignment
export async function createAssignment(
  data: CreateAssignmentRequest
): Promise<AssignmentResponse> {
  return fetchAPI<AssignmentResponse>("/instructor/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Get All Assignments (for instructor)
export async function getAssignments(
  page = 0,
  size = 20,
  courseId?: string
): Promise<AssignmentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (courseId) {
    params.append("courseId", courseId);
  }

  return fetchAPI<AssignmentListResponse>(
    `/instructor/assignments?${params.toString()}`
  );
}

// Get Single Assignment
export async function getAssignment(
  assignmentId: string
): Promise<AssignmentResponse> {
  return fetchAPI<AssignmentResponse>(`/instructor/assignments/${assignmentId}`);
}

// Update Assignment
export async function updateAssignment(
  assignmentId: string,
  data: Partial<CreateAssignmentRequest>
): Promise<AssignmentResponse> {
  return fetchAPI<AssignmentResponse>(`/instructor/assignments/${assignmentId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Delete Assignment
export async function deleteAssignment(assignmentId: string): Promise<void> {
  return fetchAPI<void>(`/instructor/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

// Get Assignment Submissions
export async function getAssignmentSubmissions(
  assignmentId: string,
  page = 0,
  size = 20
): Promise<SubmissionListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return fetchAPI<SubmissionListResponse>(
    `/instructor/assignments/${assignmentId}/submissions?${params.toString()}`
  );
}

// Provide Feedback on Submission
export async function provideFeedback(
  assignmentId: string,
  submissionId: string,
  data: ProvideFeedbackRequest
): Promise<AssignmentSubmissionResponse> {
  return fetchAPI<AssignmentSubmissionResponse>(
    `/instructor/assignments/${assignmentId}/submissions/${submissionId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// Grade Submission (alternative endpoint if backend uses this)
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback?: string
): Promise<AssignmentSubmissionResponse> {
  return fetchAPI<AssignmentSubmissionResponse>(
    `/instructor/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      body: JSON.stringify({ grade, feedback }),
    }
  );
}

// Monitor Learner Progress
export async function monitorLearnerProgress(
  courseId?: string,
  page = 0,
  size = 20
): Promise<{
  content: LearnerProgressResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (courseId) {
    params.append("courseId", courseId);
  }

  return fetchAPI(
    `/instructor/progress?${params.toString()}`
  );
}

// Get Individual Learner Progress
export async function getLearnerProgress(
  learnerId: string,
  courseId?: string
): Promise<LearnerProgressResponse> {
  const params = courseId ? `?courseId=${courseId}` : "";
  return fetchAPI<LearnerProgressResponse>(
    `/instructor/learners/${learnerId}/progress${params}`
  );
}

// Learner-side APIs

// Get Assignments for Learner
export async function getLearnerAssignments(
  courseId?: string,
  page = 0,
  size = 20
): Promise<AssignmentListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (courseId) {
    params.append("courseId", courseId);
  }

  return fetchAPI<AssignmentListResponse>(
    `/learner/assignments?${params.toString()}`
  );
}

// Submit Assignment
export async function submitAssignment(
  assignmentId: string,
  file: File
): Promise<AssignmentSubmissionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchAPI<AssignmentSubmissionResponse>(
    `/learner/assignments/${assignmentId}/submit`,
    {
      method: "POST",
      body: formData,
    }
  );
}

// Get Learner's Submission
export async function getMySubmission(
  assignmentId: string
): Promise<AssignmentSubmissionResponse> {
  return fetchAPI<AssignmentSubmissionResponse>(
    `/learner/assignments/${assignmentId}/submission`
  );
}

// Get All My Submissions
export async function getMySubmissions(
  page = 0,
  size = 20
): Promise<SubmissionListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return fetchAPI<SubmissionListResponse>(
    `/learner/submissions?${params.toString()}`
  );
}
