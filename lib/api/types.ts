// API DTOs - mirrors the Spring records in com.talentFlow.*.web.dto

export enum RoleName {
  ORG_ADMIN = "ORG_ADMIN",   // Organisation admin — created on /auth/register
  INSTRUCTOR = "INSTRUCTOR",
  INTERN = "INTERN",         // Learner role — named INTERN in the backend
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  DISABLED = "DISABLED",
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

export enum MaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
}

export enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  COMPLETED = "COMPLETED",
  REVOKED = "REVOKED",
}

export enum SubmissionStatus {
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
}

export enum ChatType {
  DIRECT = "DIRECT",
  FREE_GROUP = "FREE_GROUP",
  COHORT_CHAT = "COHORT_CHAT",
  TEAM_CHAT = "TEAM_CHAT",
}

export enum ParticipantRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/** Spring Data `Page<T>` serialised as-is by the backend. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Auth DTOs

export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/v1/auth/register - creates the organisation + its first ORG_ADMIN */
export interface RegisterRequest {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  organizationId: string;
  userId: string;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  message: string;
}

export interface AuthResponse {
  id: string;
  organizationId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  status: UserStatus;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthResponse;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ApiMessageResponse {
  message: string;
}

// Admin user DTOs

/** AdminUserSummaryResponse */
export interface AdminUserSummaryResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: RoleName;
  lastLoginAt: string | null;
}

/** AdminUserDetailResponse */
export interface AdminUserDetailResponse extends AdminUserSummaryResponse {
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

/** Backend takes a single role, not an array. */
export interface UpdateUserRolesRequest {
  role: RoleName;
}

export interface CreateInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateLearnerRequest {
  firstName: string;
  lastName: string;
  email: string;
}

/** OnboardInstructorResponse / OnboardLearnerResponse */
export interface OnboardUserResponse {
  userId: string;
  email: string;
  message: string;
}

// Program (cohort / team) DTOs

/** CohortResponse */
export interface CohortResponse {
  id: string;
  name: string;
  description: string | null;
  intakeYear: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateCohortRequest {
  name: string;
  description?: string;
  intakeYear: number;
  startDate: string;
  endDate: string;
}

/** ProjectTeamResponse */
export interface ProjectTeamResponse {
  id: string;
  cohortId: string;
  name: string;
  description: string | null;
}

export interface CreateProjectTeamRequest {
  cohortId: string;
  name: string;
  description?: string;
}

/** TeamMemberResponse */
export interface TeamMemberResponse {
  userId: string;
  email: string;
  fullName: string;
  teamRole: string;
}

export interface AllocateUserToTeamRequest {
  userId: string;
  teamRole: string;
}

/** AutoAllocateTeamMembersResponse */
export interface AutoAllocateTeamMembersResponse {
  teamId: string;
  allocatedCount: number;
  maxTeamSize: number;
  members: TeamMemberResponse[];
}

// Course DTOs

/** CourseResponse */
export interface CourseResponse {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  introVideoUrl: string | null;
  status: CourseStatus;
  publishedAt: string | null;
  archivedAt: string | null;
  createdByUserId: string;
  instructorIds: string[];
}

/** CourseDetailResponse */
export interface CourseDetailResponse {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  introVideoUrl: string | null;
  status: CourseStatus;
  progressPct: number;
  modules: CourseModuleResponse[];
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
}

export interface AssignInstructorsRequest {
  primaryInstructorId: string;
  coInstructorIds?: string[];
}

/** CourseModuleResponse - has no `description` field on the backend. */
export interface CourseModuleResponse {
  id: string;
  title: string;
  position: number;
  lessons: LessonResponse[];
}

export interface CreateCourseModuleRequest {
  title: string;
  position: number;
}

export interface CourseMaterialResponse {
  id: string;
  courseId: string;
  title: string;
  materialType: MaterialType;
  contentUrl: string;
  uploadStatus: string;
  uploadedByUserId: string;
}

// Lesson DTOs

/** LessonResponse - the type discriminator is `lessonType`, not `type`. */
export interface LessonResponse {
  id: string;
  title: string;
  lessonType: LessonType;
  position: number;
  contentUrl: string | null;
  contentText: string | null;
  completed: boolean;
}

export interface CreateLessonRequest {
  title: string;
  lessonType: LessonType;
  position: number;
  contentUrl?: string;
  contentText?: string;
}

/**
 * Frontend-only view model. The backend exposes no "list submissions for an
 * assignment" endpoint, so this shape is never populated from the API today.
 */
export interface AssignmentSubmissionResponse {
  id: string;
  assignmentId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  submissionText: string | null;
  submissionFileUrl: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

/** LessonCompletionResponse */
export interface LessonCompletionResponse {
  lessonId: string;
  courseId: string;
  progressPct: number;
  enrollmentStatus: EnrollmentStatus;
  certificateQueued: boolean;
}

// Assignment DTOs

/** AssignmentResponse */
export interface AssignmentResponse {
  id: string;
  courseId: string;
  title: string;
  instructions: string | null;
  dueAt: string | null;
  maxScore: number;
  createdByUserId: string;
}

export interface CreateAssignmentRequest {
  title: string;
  instructions?: string;
  dueAt?: string;
  maxScore?: number;
}

/** ProvideFeedbackRequest - `comment` + `score`, not `feedback` + `grade`. */
export interface ProvideFeedbackRequest {
  comment: string;
  score?: number;
}

/** AssignmentFeedbackResponse */
export interface AssignmentFeedbackResponse {
  id: string;
  submissionId: string;
  instructorUserId: string;
  comment: string;
}

/** InstructorProgressResponse - one row per learner per course. */
export interface InstructorProgressResponse {
  courseId: string;
  courseTitle: string;
  learnerId: string;
  learnerEmail: string;
  learnerName: string;
  enrollmentStatus: EnrollmentStatus;
  progressPct: number;
  totalAssignments: number;
  submittedAssignments: number;
  averageScore: number;
}

/** LearnerProgressResponse - aggregated across a learner's courses. */
export interface LearnerProgressResponse {
  learnerId: string;
  learnerEmail: string;
  learnerName: string;
  totalAssignments: number;
  submittedAssignments: number;
  averageScore: number;
}

// Notification DTOs

/** NotificationResponse */
export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Websocket push payload: UserNotificationMessage */
export interface UserNotificationMessage {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

/** Websocket push payload: CourseProgressUpdateMessage */
export interface CourseProgressUpdateMessage {
  userId: string;
  courseId: string;
  progressPct: number;
  enrollmentStatus: EnrollmentStatus;
}

// Chat DTOs

export interface SearchUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ConversationParticipantResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ParticipantRole;
  joinedAt: string;
}

export interface ConversationResponse {
  id: string;
  type: ChatType;
  name: string | null;
  cohortId: string | null;
  cohortName: string | null;
  teamId: string | null;
  teamName: string | null;
  participants: ConversationParticipantResponse[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number | null;
}

export interface CreateConversationRequest {
  type: ChatType;
  name?: string;
  cohortId?: string;
  teamId?: string;
}

export interface MessageSenderResponse {
  id: string;
  firstName: string;
  lastName: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  sender: MessageSenderResponse;
  replyToMessageId: string | null;
  replyToContent: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  replyToMessageId?: string;
}

export interface AddParticipantRequest {
  userIds: string[];
}

export interface ReadReceiptResponse {
  receipts: {
    messageId: string;
    userId: string;
    firstName: string;
    lastName: string;
    readAt: string;
  }[];
}

// Error response - GlobalExceptionHandler
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Record<string, string>;
}