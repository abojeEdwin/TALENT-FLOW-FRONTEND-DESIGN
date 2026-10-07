import { fetchAPI } from "./client";
import {
  RoleName,
  UserStatus,
  Page,
  AdminUserSummaryResponse,
  AdminUserDetailResponse,
  CohortResponse,
  CreateCohortRequest,
  ProjectTeamResponse,
  CreateProjectTeamRequest,
  TeamMemberResponse,
  AllocateUserToTeamRequest,
  AutoAllocateTeamMembersResponse,
  CreateInstructorRequest,
  CreateLearnerRequest,
  OnboardUserResponse,
} from "./types";

export { RoleName, UserStatus };

export type {
  Page,
  AdminUserSummaryResponse,
  AdminUserDetailResponse,
  CohortResponse,
  CreateCohortRequest,
  ProjectTeamResponse,
  CreateProjectTeamRequest,
  TeamMemberResponse,
  AllocateUserToTeamRequest,
  AutoAllocateTeamMembersResponse,
  CreateInstructorRequest,
  CreateLearnerRequest,
  OnboardUserResponse,
};

export interface ListUsersParams {
  query?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
  sort?: string;
}

function buildListParams({
  query,
  status,
  page = 0,
  size = 20,
  sort,
}: ListUsersParams): string {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (query) params.append("query", query);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);

  return params.toString();
}

// NOTE: Spring's PathPatternParser does not match an optional trailing
// separator, so collection endpoints mapped as @GetMapping("/") must be
// requested WITH the trailing slash or they 404.

export async function listUsers(
  params: ListUsersParams = {}
): Promise<Page<AdminUserSummaryResponse>> {
  return fetchAPI<Page<AdminUserSummaryResponse>>(
    `/admin/users/?${buildListParams(params)}`
  );
}

export async function listInstructors(
  params: ListUsersParams = {}
): Promise<Page<AdminUserSummaryResponse>> {
  return fetchAPI<Page<AdminUserSummaryResponse>>(
    `/admin/users/instructors?${buildListParams(params)}`
  );
}

export async function listUnallocatedLearners(
  params: ListUsersParams = {}
): Promise<Page<AdminUserSummaryResponse>> {
  return fetchAPI<Page<AdminUserSummaryResponse>>(
    `/admin/users/interns/unallocated?${buildListParams(params)}`
  );
}

export async function getUser(
  userId: string
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}`);
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** The backend takes a single role, not an array. */
export async function updateUserRoles(
  userId: string,
  role: RoleName
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deactivateUser(
  userId: string
): Promise<AdminUserDetailResponse> {
  return fetchAPI<AdminUserDetailResponse>(
    `/admin/users/${userId}/deactivate`,
    { method: "PATCH" }
  );
}

export async function triggerPasswordReset(userId: string): Promise<void> {
  await fetchAPI(`/admin/users/${userId}/password-reset`, { method: "POST" });
}

export async function onboardInstructor(
  request: CreateInstructorRequest
): Promise<OnboardUserResponse> {
  return fetchAPI<OnboardUserResponse>("/admin/users/instructors", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function onboardLearner(
  request: CreateLearnerRequest
): Promise<OnboardUserResponse> {
  return fetchAPI<OnboardUserResponse>("/admin/users/learners", {
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

export async function listCohorts(): Promise<CohortResponse[]> {
  return fetchAPI<CohortResponse[]>("/admin/programs/all-cohorts");
}

export async function createProjectTeam(
  request: CreateProjectTeamRequest
): Promise<ProjectTeamResponse> {
  return fetchAPI<ProjectTeamResponse>("/admin/programs/teams", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function listAllProjectTeams(): Promise<ProjectTeamResponse[]> {
  return fetchAPI<ProjectTeamResponse[]>("/admin/programs/teams");
}

export async function listCohortTeams(
  cohortId: string
): Promise<ProjectTeamResponse[]> {
  return fetchAPI<ProjectTeamResponse[]>(
    `/admin/programs/cohorts/${cohortId}/teams`
  );
}

export async function allocateUserToTeam(
  teamId: string,
  request: AllocateUserToTeamRequest
): Promise<TeamMemberResponse> {
  return fetchAPI<TeamMemberResponse>(
    `/admin/programs/teams/${teamId}/members`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function listTeamMembers(
  teamId: string
): Promise<TeamMemberResponse[]> {
  return fetchAPI<TeamMemberResponse[]>(
    `/admin/programs/teams/${teamId}/members`
  );
}

export async function autoAllocateLearners(
  teamId: string
): Promise<AutoAllocateTeamMembersResponse> {
  return fetchAPI<AutoAllocateTeamMembersResponse>(
    `/admin/programs/teams/${teamId}/members/auto-allocate`,
    { method: "POST" }
  );
}

export async function listAllocatedLearners(): Promise<TeamMemberResponse[]> {
  return fetchAPI<TeamMemberResponse[]>("/admin/programs/allocated-interns");
}