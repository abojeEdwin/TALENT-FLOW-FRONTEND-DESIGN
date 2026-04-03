// Auth & User Types
export type UserRole = 'admin' | 'instructor' | 'learner';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Admin Types
export interface UserManagementUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface UserManagementResponse {
  data: UserManagementUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// Instructor Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  status: 'draft' | 'published';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published';
}

export interface CourseContent {
  id: string;
  courseId: string;
  type: 'TEXT' | 'VIDEO' | 'PDF';
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  createdAt: string;
}

export interface CreateCourseContentRequest {
  type: 'TEXT' | 'VIDEO' | 'PDF';
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  dueDate: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  learnerId: string;
  submissionUrl: string;
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  gradedAt?: string;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  activeLearners: number;
  averageProgress: number;
  pendingAssignments: number;
}

export interface ProgressData {
  learnerId: string;
  courseId: string;
  lessonId: string;
  completionPercentage: number;
  lastAccessedAt: string;
}

// Learner Types
export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  progress: number;
  enrolledAt: string;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorId: string;
  category: string;
  lessons: Lesson[];
  enrollmentStatus: 'enrolled' | 'not-enrolled';
  progress?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  type: 'TEXT' | 'VIDEO' | 'PDF';
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface LessonProgressRequest {
  courseId: string;
  lessonId: string;
}

export interface EnrollmentRequest {
  courseId: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: Record<string, unknown>;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Real-time WebSocket Types
export interface WebSocketMessage {
  type: 'LESSON_PROGRESS_UPDATE' | 'COURSE_UPDATE' | 'ASSIGNMENT_UPDATE';
  payload: Record<string, unknown>;
}
