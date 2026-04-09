// API Response/Request Types

export enum RoleName {
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  INTERN = "INTERN",
}

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum LessonType {
  VIDEO = "VIDEO",
  PDF = "PDF",
  TEXT = "TEXT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  DISABLED = "DISABLED",
  INACTIVE = "INACTIVE",
}

export enum ProgramStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum TeamStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthResponse;
}

export interface RegisterResponse {
  id: string;
  email: string;
  message: string;
}

// User DTOs
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UpdateUserRolesRequest {
  role: RoleName;
}

export interface UserListResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Instructor DTOs
export interface InstructorOnboardingRequest {
  bio?: string;
  expertise?: string;
  hourlyRate?: number;
}

// Program DTOs
export interface CohortResponse {
  id: string;
  name: string;
  program: string;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamResponse {
  id: string;
  name: string;
  cohort: string;
  status: TeamStatus;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  id: string;
  user: UserResponse;
  team: string;
  joinedAt: string;
}

export interface AllocateTeamMemberRequest {
  userId: string;
  teamId: string;
}

// Course DTOs
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  instructor?: UserResponse;
  status: CourseStatus;
  coverImage?: string;
  introVideo?: string;
  duration: number;
  level: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseListResponse {
  content: CourseResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  level?: string;
  tags?: string[];
  duration?: number;
  status?: CourseStatus;
}

// Lesson DTOs
export interface LessonResponse {
  id: string;
  title: string;
  type: LessonType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteLessonRequest {
  timeSpent: number;
}

export interface LessonProgressResponse {
  id: string;
  lesson: string;
  user: string;
  progress: number;
  completed: boolean;
  lastAccessedAt: string;
}

// Material DTOs
export interface MaterialResponse {
  id: string;
  title: string;
  course: string;
  fileUrl: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMaterialRequest {
  title: string;
  course: string;
}

// Assignment DTOs
export interface AssignmentResponse {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  course: string;
  dueDate: string;
}

export interface AssignmentSubmissionResponse {
  id: string;
  assignment: string;
  user: string;
  submittedAt: string;
  fileUrl: string;
  feedback?: string;
  grade?: number;
}

// Progress DTOs
export interface ProgressResponse {
  id: string;
  user: string;
  course: string;
  progress: number;
  completed: boolean;
  lastAccessedAt: string;
}

export interface ProgressStreamMessage {
  userId: string;
  courseId: string;
  lessonId: string;
  progress: number;
  timestamp: string;
}

// Enrollment DTOs
export interface EnrollmentResponse {
  id: string;
  user: string;
  course: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
}

// Error Response
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Record<string, string>;
}
