import { RoleName, UserStatus, CourseStatus, LessonType } from "@/lib/api/types";

export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [RoleName.ADMIN]: "Administrator",
  [RoleName.INSTRUCTOR]: "Instructor",
  [RoleName.INTERN]: "Learner",
  [RoleName.MENTOR]: "Mentor",
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.PENDING_VERIFICATION]: "bg-yellow-100 text-yellow-800",
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UserStatus.LOCKED]: "bg-red-100 text-red-800",
  [UserStatus.DISABLED]: "bg-gray-100 text-gray-800",
  [UserStatus.INACTIVE]: "bg-gray-100 text-gray-800",
  [UserStatus.SUSPENDED]: "bg-red-100 text-red-800",
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "bg-yellow-100 text-yellow-800",
  [CourseStatus.PUBLISHED]: "bg-green-100 text-green-800",
  [CourseStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
};

export const LESSON_TYPE_ICONS: Record<LessonType, string> = {
  [LessonType.VIDEO]: "🎥",
  [LessonType.PDF]: "📄",
  [LessonType.TEXT]: "📝",
};

export const PERMISSIONS = {
  USER_MANAGE: ["ADMIN"],
  COURSE_MANAGE: ["ADMIN", "MENTOR"],
  PROGRAM_MANAGE: ["ADMIN"],
  REPORT_VIEW: ["ADMIN"],
  INSTRUCTOR_ONBOARD: ["ADMIN"],
  TEAM_MANAGE: ["ADMIN"],
  COURSE_CREATE: ["MENTOR"],
  COURSE_ENROLL: ["INTERN"],
} as const;

export const ADMIN_MENU_ITEMS = [
  { label: "Users", href: "/dashboard/admin/users" },
  { label: "Instructors", href: "/dashboard/admin/instructors" },
  { label: "Programs", href: "/dashboard/admin/programs" },
  { label: "Courses", href: "/dashboard/admin/courses" },
];

export const INSTRUCTOR_MENU_ITEMS = [
  { label: "My Courses", href: "/dashboard/instructor/courses" },
  { label: "Materials", href: "/dashboard/instructor/materials" },
  { label: "Assignments", href: "/dashboard/instructor/assignments" },
  { label: "Progress", href: "/dashboard/instructor/progress" },
];

export const LEARNER_MENU_ITEMS = [
  { label: "Browse Courses", href: "/dashboard/learner/courses" },
  { label: "My Courses", href: "/dashboard/learner/my-courses" },
  { label: "Profile", href: "/dashboard/learner/profile" },
];

export const SHARED_MENU_ITEMS = [
  { label: "Profile Settings", href: "/dashboard/profile" },
];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DEFAULT_PAGE_SIZE = 20;
