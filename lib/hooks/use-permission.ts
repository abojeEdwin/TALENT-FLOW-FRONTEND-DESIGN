import { useAuth } from "@/lib/context/auth-context";
import { PERMISSIONS } from "@/lib/utils/constants";

type PermissionKey = keyof typeof PERMISSIONS;

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;

    const allowedRoles = PERMISSIONS[permission];
    return user.roles.some((role) => allowedRoles.includes(role as any));
  };

  return { hasPermission };
}
