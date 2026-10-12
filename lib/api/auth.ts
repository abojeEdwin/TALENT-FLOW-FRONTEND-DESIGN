import { fetchAPI } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthResponse,
  LoginResponse,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyPasswordResetPinRequest,
  VerifyPasswordResetPinResponse,
  ApiMessageResponse,
} from "./types";

/** POST /api/v1/auth/login */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const request: LoginRequest = { email, password };
  return fetchAPI<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

/**
 * POST /api/v1/auth/register
 * Creates the organisation and its first ORG_ADMIN in one step, and returns a
 * usable access token so the caller can skip a second login round-trip.
 */
export async function registerOrganisation(
  data: RegisterRequest
): Promise<RegisterResponse> {
  return fetchAPI<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

/** GET /api/v1/auth/me */
export async function getCurrentUser(): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>("/auth/me");
}

/** POST /api/v1/auth/logout */
export async function logoutUser(): Promise<void> {
  await fetchAPI("/auth/logout", { method: "POST" });
}

/**
 * POST /api/v1/auth/reset-password
 * Consumes a reset token. Tokens are issued by an ORG_ADMIN through
 * POST /api/v1/admin/users/{userId}/password-reset - the backend does not
 * expose a self-service "request a reset link" endpoint.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const request: ResetPasswordRequest = { token, newPassword };
  await fetchAPI("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

/**
 * POST /api/v1/auth/forgot-password
 * Initiates the password reset flow by sending a PIN to the user's email
 */
export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  const request: ForgotPasswordRequest = { email };
  return fetchAPI<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

/**
 * POST /api/v1/auth/verify-password-reset-pin
 * Verifies the PIN and returns a reset token for password reset
 */
export async function verifyPasswordResetPin(
  email: string,
  pin: string
): Promise<VerifyPasswordResetPinResponse> {
  const request: VerifyPasswordResetPinRequest = { email, pin };
  return fetchAPI<VerifyPasswordResetPinResponse>("/auth/verify-password-reset-pin", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

/**
 * POST /api/v1/auth/reset-password
 * Resets the password using the token obtained from PIN verification
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<ApiMessageResponse> {
  const request: ResetPasswordRequest = { token, newPassword };
  return fetchAPI<ApiMessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

// Store JWT token
export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

// Get JWT token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}