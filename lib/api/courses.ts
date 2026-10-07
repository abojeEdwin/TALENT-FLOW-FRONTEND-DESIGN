import { fetchAPI, APIError } from "./client";
import {
  ErrorResponse,
  Page,
  CourseResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  LessonResponse,
  CourseModuleResponse,
  CreateCourseModuleRequest,
  CreateLessonRequest,
  AssignInstructorsRequest,
  CourseStatus,
  LessonCompletionResponse,
} from "./types";

// Learner endpoints

/** GET /api/v1/learner/courses - flat list of published courses. */
export async function fetchPublishedCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/learner/courses");
}

/** GET /api/v1/learner/courses/my */
export async function fetchLearnerCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/learner/courses/my");
}

/** GET /api/v1/learner/courses/{courseId} */
/**
 * There is no `GET /api/v1/instructor/courses/{courseId}` on the backend, so the
 * single-course view is derived from the instructor's own course list.
 */
export async function fetchInstructorCourseDetail(
  courseId: string
): Promise<CourseResponse> {
  const page = await fetchAPI<Page<CourseResponse>>(
    `/instructor/my-courses?page=0&size=100`
  );
  const course = page.content.find((c) => c.id === courseId);
  if (!course) {
    throw new APIError(404, {
      status: 404,
      error: "Not Found",
      message: `Course ${courseId} not found`,
      path: `/instructor/courses/${courseId}`,
    } as ErrorResponse);
  }
  return course;
}

export async function fetchCourseDetail(
  id: string
): Promise<CourseDetailResponse> {
  return fetchAPI<CourseDetailResponse>(`/learner/courses/${id}`);
}

/** POST /api/v1/learner/courses/{courseId}/enroll */
export async function enrollCourse(
  courseId: string
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/learner/courses/${courseId}/enroll`, {
    method: "POST",
  });
}

/** POST /api/v1/lessons/{lessonId}/complete */
export async function completeLesson(
  lessonId: string
): Promise<LessonCompletionResponse> {
  return fetchAPI<LessonCompletionResponse>(`/lessons/${lessonId}/complete`, {
    method: "POST",
  });
}

/** GET /api/v1/instructor/lessons/{lessonId} */
export async function fetchLessonDetail(
  lessonId: string
): Promise<LessonResponse> {
  return fetchAPI<LessonResponse>(`/instructor/lessons/${lessonId}`);
}

// Instructor endpoints

/** GET /api/v1/instructor/my-courses - Spring Page, not a bare array. */
export async function fetchInstructorCourses(params?: {
  status?: CourseStatus;
  page?: number;
  size?: number;
}): Promise<CourseResponse[]> {
  const search = new URLSearchParams({
    page: (params?.page ?? 0).toString(),
    size: (params?.size ?? 20).toString(),
  });
  if (params?.status) search.append("status", params.status);

  const response = await fetchAPI<Page<CourseResponse>>(
    `/instructor/my-courses?${search.toString()}`
  );
  return response.content ?? [];
}

/**
 * POST /api/v1/instructor/courses
 * Send multipart when media is attached, otherwise JSON.
 */
export async function createCourse(
  data: CreateCourseRequest,
  coverImage?: File,
  introVideo?: File
): Promise<CourseResponse> {
  if (coverImage || introVideo) {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (coverImage) formData.append("coverImage", coverImage);
    if (introVideo) formData.append("introVideo", introVideo);

    return fetchAPI<CourseResponse>("/instructor/courses", {
      method: "POST",
      body: formData,
    });
  }

  return fetchAPI<CourseResponse>("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Admin endpoints

/** GET /api/v1/admin/courses */
export async function fetchAdminCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/admin/courses");
}

export async function publishCourse(
  courseId: string
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/publish`, {
    method: "PATCH",
  });
}

export async function unpublishCourse(
  courseId: string
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/unpublish`, {
    method: "PATCH",
  });
}

export async function archiveCourse(
  courseId: string
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/archive`, {
    method: "PATCH",
  });
}

/** PUT /api/v1/admin/courses/{courseId}/instructors */
export async function assignInstructors(
  courseId: string,
  data: AssignInstructorsRequest
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/instructors`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** GET /api/v1/admin/courses/{courseId}/enrollments/... */
export async function revokeEnrollment(
  courseId: string,
  userId: string
): Promise<void> {
  await fetchAPI(`/admin/courses/${courseId}/enrollments/${userId}`, {
    method: "DELETE",
  });
}

export async function bulkEnrollCohort(
  courseId: string,
  cohortId: string
): Promise<void> {
  await fetchAPI(
    `/admin/courses/${courseId}/enrollments/cohorts/${cohortId}`,
    { method: "POST" }
  );
}

export async function bulkEnrollTeam(
  courseId: string,
  teamId: string
): Promise<void> {
  await fetchAPI(`/admin/courses/${courseId}/enrollments/teams/${teamId}`, {
    method: "POST",
  });
}

// Course module endpoints

export async function createCourseModule(
  courseId: string,
  data: CreateCourseModuleRequest
): Promise<CourseModuleResponse> {
  return fetchAPI<CourseModuleResponse>(
    `/instructor/courses/${courseId}/modules`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function fetchCourseModules(
  courseId: string
): Promise<CourseModuleResponse[]> {
  const result = await fetchAPI<CourseModuleResponse[] | { content: CourseModuleResponse[] }>(
    `/instructor/courses/${courseId}/modules`
  );
  // Backend may return a Spring Page wrapper or a bare array
  if (Array.isArray(result)) {
    return result;
  }
  if (result && Array.isArray((result as { content: CourseModuleResponse[] }).content)) {
    return (result as { content: CourseModuleResponse[] }).content;
  }
  return [];
}

export async function updateCourseModule(
  moduleId: string,
  data: CreateCourseModuleRequest
): Promise<CourseModuleResponse> {
  return fetchAPI<CourseModuleResponse>(`/instructor/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCourseModule(moduleId: string): Promise<void> {
  await fetchAPI(`/instructor/modules/${moduleId}`, { method: "DELETE" });
}

// Lesson endpoints
// NOTE: the backend has no "list lessons for a module" endpoint. Lessons are
// read through GET /instructor/courses/{courseId}/modules, which nests them.

export async function createLesson(
  moduleId: string,
  data: CreateLessonRequest
): Promise<LessonResponse> {
  return fetchAPI<LessonResponse>(`/instructor/modules/${moduleId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createLessonWithFile(
  moduleId: string,
  title: string,
  lessonType: LessonResponse["lessonType"],
  position: number,
  file: File
): Promise<LessonResponse> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("lessonType", lessonType);
  formData.append("position", position.toString());
  formData.append("file", file);

  return fetchAPI<LessonResponse>(`/instructor/modules/${moduleId}/lessons`, {
    method: "POST",
    body: formData,
  });
}

export async function updateLesson(
  lessonId: string,
  data: CreateLessonRequest
): Promise<LessonResponse> {
  return fetchAPI<LessonResponse>(`/instructor/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await fetchAPI(`/instructor/lessons/${lessonId}`, { method: "DELETE" });
}

// Cover images
// The cover-image endpoint answers with a 302 to a presigned S3 URL, so it is
// called directly rather than through fetchAPI (which cannot follow the
// redirect manually).

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";

export async function fetchCourseCoverImagePresignedUrl(
  courseId: string
): Promise<string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  const response = await fetch(
    `${API_BASE_URL}/${API_VERSION}/courses/${courseId}/cover-image`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      redirect: "manual",
    }
  );

  if (response.status === 302 || response.status === 301) {
    const location = response.headers.get("Location");
    if (location) return location;
  }

  throw new Error("Failed to get cover image URL");
}

async function withCoverImages(
  courses: CourseResponse[]
): Promise<CourseResponse[]> {
  if (!courses?.length) return [];

  return Promise.all(
    courses.map(async (course) => {
      try {
        const url = await fetchCourseCoverImagePresignedUrl(course.id);
        return { ...course, coverImageUrl: url };
      } catch {
        return course;
      }
    })
  );
}

export async function fetchPublishedCoursesWithCoverImages(): Promise<
  CourseResponse[]
> {
  return withCoverImages(await fetchPublishedCourses());
}

export async function fetchLearnerCoursesWithCoverImages(): Promise<
  CourseResponse[]
> {
  return withCoverImages(await fetchLearnerCourses());
}

export async function fetchInstructorCoursesWithCoverImages(): Promise<
  CourseResponse[]
> {
  return withCoverImages(await fetchInstructorCourses());
}