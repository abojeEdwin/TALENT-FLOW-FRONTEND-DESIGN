import { fetchAPI } from "./client";
import { UserStatus, RoleName } from "./types";

export { RoleName, UserStatus } from "./types";

export interface AdminUserSummaryResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
  status: UserStatus;
  createdAt: string;
}

export interface AdminUserDetailResponse extends AdminUserSummaryResponse {
  updatedAt: string;
}

export interface CohortResponse {
  id: string;
  name: string;
  description?: string;
  intakeYear: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeamResponse {
  id: string;
  name: string;
  cohortId: string;
  status: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  teamId: string;
  role: string;
  joinedAt: string;
}

export interface CreateCohortRequest {
  name: string;
  description?: string;
  intakeYear: number;
  startDate: string;
  endDate: string;
}

export interface CreateProjectTeamRequest {
  name: string;
  cohortId: string;
}

export interface AllocateUserToTeamRequest {
  userId: string;
  role?: string;
}

export interface CreateInstructorRequest {
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  expertise?: string;
}

export interface OnboardInstructorResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
  status: UserStatus;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export async function listUsers(
  query?: string,
  status?: UserStatus,
  page: number = 0,
  size: number = 20,
  sort?: string
): Promise<PagedResponse<AdminUserSummaryResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (query) params.append("query", query);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);

  return fetchAPI<PagedResponse<AdminUserSummaryResponse>>(`/admin/users?${params.toString()}`);
}

export async function getUser(userId: string): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}`);
}

export async function updateUserStatus(
  userId: string,
  newStatus: UserStatus
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
}

export async function updateUserRoles(
  userId: string,
  roleNames: RoleName[]
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roles: roleNames }),
  });
}

export async function deactivateUser(userId: string): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}/deactivate`, {
    method: "POST",
  });
}

export async function triggerPasswordReset(userId: string): Promise<void> {
  return fetchAPI<void>(`/admin/users/${userId}/password-reset`, {
    method: "POST",
  });
}

export async function onboardInstructor(
  request: CreateInstructorRequest
): Promise<OnboardInstructorResponse> {
  return fetchAPI<OnboardInstructorResponse>("/admin/instructors/onboard", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createCohort(
  request: CreateCohortRequest
): Promise<CohortResponse> {
  return fetchAPI<CohortResponse>("/admin/programs/cohorts", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createProjectTeam(
  request: CreateProjectTeamRequest
): Promise<ProjectTeamResponse> {
  return fetchAPI<ProjectTeamResponse>("/admin/teams", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function allocateUserToTeam(
  teamId: string,
  request: AllocateUserToTeamRequest
): Promise<TeamMemberResponse> {
  return fetchAPI<TeamMemberResponse>(`/admin/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function listCohortTeams(
  cohortId: string
): Promise<ProjectTeamResponse[]> {
  return fetchAPI<ProjectTeamResponse[]>(`/admin/cohorts/${cohortId}/teams`);
}

export async function listCohorts(): Promise<CohortResponse[]> {
  return fetchAPI<CohortResponse[]>("/admin/programs/all-cohorts");
}