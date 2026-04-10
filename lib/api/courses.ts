import { fetchAPI } from "./client";
import {
  CourseListResponse,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  EnrollmentResponse,
  AssignInstructorsRequest,
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

export async function fetchMyCoursesWithCoverImages(): Promise<CourseResponse[]> {
  const courses = await fetchMyCourses();
  
  if (!courses?.length) {
    return [];
  }

  const coursesWithImages = await Promise.all(
    courses.map(async (course) => {
      try {
        const { presignedUrl } = await fetchCourseCoverImagePresignedUrl(course.id);
        return { ...course, coverImageUrl: presignedUrl };
      } catch (err) {
        console.log("Failed to get cover image for course:", course.id, err);
        return course;
      }
    })
  );

  return coursesWithImages;
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
  data: CreateCourseRequest,
  coverImage?: File,
  introVideo?: File
): Promise<CourseResponse> {
  // If files are provided, use multipart form data
  if (coverImage || introVideo) {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (coverImage) formData.append("coverImage", coverImage);
    if (introVideo) formData.append("introVideo", introVideo);

    return fetchAPI<CourseResponse>("/instructor/courses", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  // Otherwise use JSON
  return fetchAPI<CourseResponse>("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(data),
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

// Admin endpoints
export async function fetchAdminCourses(status?: string): Promise<CourseResponse[]> {
  const params = new URLSearchParams({});
  if (status) params.append("status", status);
  const queryString = params.toString();
  return fetchAPI<CourseResponse[]>(`/admin/courses${queryString ? `?${queryString}` : ''}`);
}

export async function publishCourse(courseId: string): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/publish`, {
    method: "PATCH",
  });
}

export async function unpublishCourse(courseId: string): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/unpublish`, {
    method: "PATCH",
  });
}

export async function archiveCourse(courseId: string): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/archive`, {
    method: "PATCH",
  });
}

export async function fetchCourseCoverImagePresignedUrl(
  courseId: string
): Promise<{ presignedUrl: string }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/courses/${courseId}/cover-image`, {
    method: "GET",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    redirect: "manual",
  });

  if (response.status === 302 || response.status === 301) {
    const location = response.headers.get("Location");
    if (location) {
      return { presignedUrl: location };
    }
  }
  
  throw new Error("Failed to get cover image URL");
}

export async function fetchPublishedCoursesWithCoverImages(
  page: number = 0,
  size: number = 20,
  level?: string,
  tags?: string[]
): Promise<CourseResponse[]> {
  const response = await fetchPublishedCourses(page, size, level, tags);
  
  if (!response.content?.length) {
    return [];
  }

  const coursesWithImages = await Promise.all(
    response.content.map(async (course) => {
      try {
        const { presignedUrl } = await fetchCourseCoverImagePresignedUrl(course.id);
        return { ...course, coverImageUrl: presignedUrl };
      } catch (err) {
        console.log("Failed to get cover image for course:", course.id, err);
        return course;
      }
    })
  );

  return coursesWithImages;
}

export async function assignInstructors(
  courseId: string,
  data: AssignInstructorsRequest
): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/admin/courses/${courseId}/instructors`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
