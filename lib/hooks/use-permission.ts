import { useAuth } from "@/lib/context/auth-context";
import { RoleName } from "@/lib/api/types";

const PERMISSIONS: Record<string, RoleName[]> = {
  manageUsers: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN],
  manageCourses: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN, RoleName.INSTRUCTOR],
  managePrograms: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN],
  viewAnalytics: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN, RoleName.INSTRUCTOR],
  onboardUsers: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN, RoleName.INSTRUCTOR],
  manageTeams: [RoleName.ORG_ADMIN, RoleName.SUPER_ADMIN],
  enrollCourse: [RoleName.LEARNER],
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