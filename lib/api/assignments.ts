import { fetchAPI } from "./client";
import {
  Page,
  AssignmentResponse,
  CreateAssignmentRequest,
  AssignmentFeedbackResponse,
  ProvideFeedbackRequest,
  InstructorProgressResponse,
} from "./types";

/**
 * The backend exposes no assignment-update endpoint and no way to list or
 * fetch submissions, so there is no `updateAssignment` or
 * `getAssignmentSubmissions` here. Feedback is applied to a known
 * submissionId via POST /instructor/submissions/{submissionId}/feedback.
 */

/** POST /api/v1/instructor/courses/{courseId}/assignments */
export async function createAssignment(
  courseId: string,
  data: CreateAssignmentRequest
): Promise<AssignmentResponse> {
  return fetchAPI<AssignmentResponse>(
    `/instructor/courses/${courseId}/assignments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/** GET /api/v1/instructor/assignments */
export async function getAssignments(params?: {
  courseId?: string;
  page?: number;
  size?: number;
}): Promise<Page<AssignmentResponse>> {
  const search = new URLSearchParams({
    page: (params?.page ?? 0).toString(),
    size: (params?.size ?? 20).toString(),
  });
  if (params?.courseId) search.append("courseId", params.courseId);

  return fetchAPI<Page<AssignmentResponse>>(
    `/instructor/assignments?${search.toString()}`
  );
}

/** GET /api/v1/instructor/assignments/{assignmentId} */
export async function getAssignment(
  assignmentId: string
): Promise<AssignmentResponse> {
  return fetchAPI<AssignmentResponse>(
    `/instructor/assignments/${assignmentId}`
  );
}

/** DELETE /api/v1/instructor/assignments/{assignmentId} */
export async function deleteAssignment(
  assignmentId: string
): Promise<void> {
  await fetchAPI(`/instructor/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

/** POST /api/v1/instructor/submissions/{submissionId}/feedback */
export async function provideFeedback(
  submissionId: string,
  data: ProvideFeedbackRequest
): Promise<AssignmentFeedbackResponse> {
  return fetchAPI<AssignmentFeedbackResponse>(
    `/instructor/submissions/${submissionId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/** GET /api/v1/instructor/progress - one row per enrolled learner per course. */
export async function getInstructorProgress(params?: {
  courseId?: string;
  page?: number;
  size?: number;
}): Promise<Page<InstructorProgressResponse>> {
  const search = new URLSearchParams({
    page: (params?.page ?? 0).toString(),
    size: (params?.size ?? 20).toString(),
  });
  if (params?.courseId) search.append("courseId", params.courseId);

  return fetchAPI<Page<InstructorProgressResponse>>(
    `/instructor/progress?${search.toString()}`
  );
}

/** GET /api/v1/instructor/courses/{courseId}/progress */
export async function getCourseProgress(
  courseId: string
): Promise<InstructorProgressResponse[]> {
  return fetchAPI<InstructorProgressResponse[]>(
    `/instructor/courses/${courseId}/progress`
  );
}