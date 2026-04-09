import { fetchAPI } from "./client";
import {
  CourseListResponse,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  EnrollmentResponse,
} from "./types";

// Learner endpoints
export async function fetchPublishedCourses(
  page: number = 0,
  size: number = 20,
  level?: string,
  tags?: string[]
): Promise<CourseListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    status: "PUBLISHED",
  });

  if (level) params.append("level", level);
  if (tags?.length) tags.forEach((tag) => params.append("tags", tag));

  return fetchAPI<CourseListResponse>(`/courses?${params.toString()}`);
}

export async function fetchMyCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/instructor/my-courses");
}

export async function fetchCourseById(id: string): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/courses/${id}`);
}

export async function enrollCourse(courseId: string): Promise<EnrollmentResponse> {
  return fetchAPI<EnrollmentResponse>(`/courses/${courseId}/enroll`, {
    method: "POST",
  });
}

// Instructor endpoints
export async function createCourse(
  data: CreateCourseRequest
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCourseWithMedia(
  title: string,
  description: string,
  level: string,
  tags: string[],
  duration: number,
  coverImage?: File,
  introVideo?: File
): Promise<CourseResponse> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("level", level);
  tags.forEach((tag) => formData.append("tags", tag));
  formData.append("duration", duration.toString());
  if (coverImage) formData.append("coverImage", coverImage);
  if (introVideo) formData.append("introVideo", introVideo);

  return fetchAPI<CourseResponse>("/instructor/courses", {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
}

export async function updateCourse(
  id: string,
  data: UpdateCourseRequest
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  return fetchAPI<void>(`/courses/${id}`, {
    method: "DELETE",
  });
}
