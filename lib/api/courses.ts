import { fetchAPI } from "./client";
import {
  CourseListResponse,
  CourseResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  EnrollmentResponse,
  AssignInstructorsRequest,
  CourseModuleResponse,
  CreateCourseModuleRequest,
  LessonResponse,
  CreateLessonRequest,
} from "./types";

// Learner endpoints
export async function fetchPublishedCourses(
  page: number = 0,
  size: number = 20,
  level?: string,
  tags?: string[]
): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>(`/learner/courses`);
}

export async function fetchLearnerCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/learner/courses/my");
}

export async function fetchLearnerCoursesWithCoverImages(): Promise<CourseResponse[]> {
  const courses = await fetchLearnerCourses();
  
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
  return fetchAPI<CourseResponse>(`/learner/courses/${id}`);
}

export async function fetchCourseDetail(id: string): Promise<CourseDetailResponse> {
  return fetchAPI<CourseDetailResponse>(`/learner/courses/${id}`);
}

export async function enrollCourse(courseId: string): Promise<CourseResponse> {
  return fetchAPI<CourseResponse>(`/learner/courses/${courseId}/enroll`, {
    method: "POST",
  });
}

// Instructor endpoints
export async function fetchInstructorCourses(): Promise<CourseResponse[]> {
  return fetchAPI<CourseResponse[]>("/instructor/my-courses");
}

export async function fetchInstructorCoursesWithCoverImages(): Promise<CourseResponse[]> {
  const courses = await fetchInstructorCourses();
  
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
  const courses = await fetchPublishedCourses(page, size, level, tags);
  
  if (!courses?.length) {
    return [];
  }

  const coursesWithImages = await Promise.all(
    courses.map(async (course: CourseResponse) => {
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

// Course Module endpoints
export async function createCourseModule(
  courseId: string,
  data: CreateCourseModuleRequest
): Promise<CourseModuleResponse> {
  return fetchAPI<CourseModuleResponse>(`/instructor/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchCourseModules(courseId: string): Promise<CourseModuleResponse[]> {
  return fetchAPI<CourseModuleResponse[]>(`/instructor/courses/${courseId}/modules`);
}

// Lesson endpoints
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
  lessonType: string,
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
    headers: {},
  });
}

export async function fetchModuleLessons(moduleId: string): Promise<LessonResponse[]> {
  return fetchAPI<LessonResponse[]>(`/instructor/modules/${moduleId}/lessons`);
}
