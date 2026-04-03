import { z } from "zod";

// Auth validators
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-zA-Z]/, "Password must contain letters")
    .regex(/\d/, "Password must contain numbers"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-zA-Z]/, "Password must contain letters")
    .regex(/\d/, "Password must contain numbers"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// User validators
export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED", "SUSPENDED"]),
});

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(["ADMIN", "MENTOR", "INTERN"])).min(1, "At least one role is required"),
});

// Course validators
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  level: z.string().min(1, "Level is required"),
  tags: z.array(z.string()).optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
});

export const updateCourseSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  level: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.number().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

// Assignment validators
export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  course: z.string().min(1, "Course is required"),
  dueDate: z.string().datetime("Invalid date"),
});

// Material validators
export const uploadMaterialSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  course: z.string().min(1, "Course is required"),
  file: z.instanceof(File).refine(
    (file) => file.size <= 100 * 1024 * 1024,
    "File must be less than 100MB"
  ),
});

// Type exports for form usage
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
export type UploadMaterialFormData = z.infer<typeof uploadMaterialSchema>;
