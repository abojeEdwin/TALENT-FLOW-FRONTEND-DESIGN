import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['admin', 'instructor', 'learner']),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const EmailVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 characters'),
});

export type EmailVerificationFormData = z.infer<typeof EmailVerificationSchema>;

export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type PasswordResetFormData = z.infer<typeof PasswordResetSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

// Course Schemas
export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(180, 'Title must be at most 180 characters'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters'),
});

export type CreateCourseFormData = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be at most 100 characters')
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type UpdateCourseFormData = z.infer<typeof UpdateCourseSchema>;

export const CreateCourseContentSchema = z.object({
  type: z.enum(['TEXT', 'VIDEO', 'PDF']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string().optional(),
  videoUrl: z.string().url('Invalid URL').optional(),
  pdfUrl: z.string().url('Invalid URL').optional(),
  order: z.number().int().positive('Order must be a positive number'),
});

export type CreateCourseContentFormData = z.infer<typeof CreateCourseContentSchema>;

export const CreateAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  dueDate: z.string().datetime('Invalid date format'),
});

export type CreateAssignmentFormData = z.infer<typeof CreateAssignmentSchema>;

// Module Schemas
export const CreateModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  position: z.number().int().positive('Position must be a positive number'),
});

export type CreateModuleFormData = z.infer<typeof CreateModuleSchema>;

// Lesson Schemas
export const CreateLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  type: z.enum(['VIDEO', 'PDF', 'TEXT']),
  content: z.string().optional(),
  position: z.number().int().positive().optional(),
});

export type CreateLessonFormData = z.infer<typeof CreateLessonSchema>;

// Admin Schemas
export const UpdateUserRoleSchema = z.object({
  role: z.enum(['admin', 'instructor', 'learner']),
});

export type UpdateUserRoleFormData = z.infer<typeof UpdateUserRoleSchema>;

// Learner Schemas
export const EnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export type EnrollmentFormData = z.infer<typeof EnrollmentSchema>;

export const LessonProgressSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
});

export type LessonProgressFormData = z.infer<typeof LessonProgressSchema>;
