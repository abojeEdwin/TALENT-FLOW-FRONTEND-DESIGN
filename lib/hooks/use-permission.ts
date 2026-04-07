import { useAuth } from "@/lib/context/auth-context";

const PERMISSIONS: Record<string, string[]> = {
  manageUsers: ["ADMIN"],
  manageCourses: ["ADMIN", "INSTRUCTOR"],
  viewAnalytics: ["ADMIN", "INSTRUCTOR"],
  enrollCourse: ["INTERN"],
};

type PermissionKey = keyof typeof PERMISSIONS;

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;
    const allowedRoles = PERMISSIONS[permission];
    return allowedRoles?.includes(user.role) ?? false;
  };

  return { hasPermission };
}
