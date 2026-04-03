"use client";

import { useEffect, useState } from "react";
import { fetchUsers, updateUserStatus, updateUserRoles } from "@/lib/api/users";
import { triggerPasswordReset } from "@/lib/api/admin";
import { RoleGuard } from "@/components/shared/role-guard";
import { StatusChip } from "@/components/shared/status-chip";
import { EmptyState } from "@/components/shared/empty-state";
import { UserListResponse, UserResponse, UserStatus, RoleName } from "@/lib/api/types";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import { ROLE_DISPLAY_NAMES } from "@/lib/utils/constants";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUsers(page, pageSize);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize]);

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setIsUpdating(true);
    try {
      await updateUserStatus(userId, newStatus);
      toast.success("User status updated");
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update user status");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRolesChange = async (userId: string, role: string) => {
    setIsUpdating(true);
    try {
      await updateUserRoles(userId, role);
      toast.success("User role updated");
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update user role");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <RoleGuard roles={[RoleName.ADMIN]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage system users, roles, and permissions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="There are no users in the system yet"
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {user.role && (
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900">
                            {ROLE_DISPLAY_NAMES[user.role as RoleName] || user.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusChip status={user.status} type="user" />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Edit User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-xl max-w-md w-full mx-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Edit User: {selectedUser.firstName} {selectedUser.lastName}
              </h2>

              <div className="space-y-4">
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) =>
                      handleStatusChange(selectedUser.id, e.target.value as UserStatus)
                    }
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  >
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="ACTIVE">Active</option>
                    <option value="LOCKED">Locked</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>

                {/* Roles Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="space-y-2">
                    {(Object.values(RoleName) as RoleName[]).map((role) => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={selectedUser.role === role}
                          onChange={(e) => {
                            handleRolesChange(selectedUser.id, e.target.value);
                          }}
                          disabled={isUpdating}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {ROLE_DISPLAY_NAMES[role]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Deactivate User */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, UserStatus.DISABLED)}
                    disabled={isUpdating || selectedUser.status === UserStatus.DISABLED}
                    className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-300"
                  >
                    {isUpdating ? "Processing..." : "Deactivate User"}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Sets the user status to Inactive
                  </p>
                </div>

                {/* Trigger Password Reset */}
                <div>
                  <button
                    onClick={async () => {
                      try {
                        setIsUpdating(true);
                        await triggerPasswordReset(selectedUser.id);
                        toast.success(`Password reset email sent to ${selectedUser.email}`);
                      } catch (error) {
                        toast.error("Failed to send password reset email");
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Trigger Password Reset
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Sends a password reset email to the user
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
