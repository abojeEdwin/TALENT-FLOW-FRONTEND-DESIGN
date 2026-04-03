import { fetchAPI } from "./client";
import {
  UserListResponse,
  UserResponse,
  UpdateUserStatusRequest,
  UpdateUserRolesRequest,
  RoleName,
} from "./types";

export async function fetchUsers(
  page: number = 0,
  size: number = 20,
  sort?: string,
  search?: string
): Promise<UserListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (sort) params.append("sort", sort);
  if (search) params.append("search", search);

  return fetchAPI<UserListResponse>(`/admin/users/`);
}

export async function fetchUserById(id: string): Promise<UserResponse> {
  return fetchAPI<UserResponse>(`/users/${id}`);
}

export async function updateUserStatus(
  id: string,
  status: string
): Promise<UserResponse> {
  const request: UpdateUserStatusRequest = { status: status as any };
  return fetchAPI<UserResponse>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function updateUserRoles(
  id: string,
  role: string
): Promise<UserResponse> {
  const request: UpdateUserRolesRequest = { role: role as RoleName };
  return fetchAPI<UserResponse>(`/admin/users/${id}/roles`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteUser(id: string): Promise<void> {
  return fetchAPI<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
