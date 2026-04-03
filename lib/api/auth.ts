import { fetchAPI } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ResetPasswordRequest,
} from "./types";

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const request: LoginRequest = { email, password };
  return fetchAPI<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const request: RegisterRequest = {
    firstName,
    lastName,
    email,
    password,
  };
  return fetchAPI<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>("/auth/me");
}

export async function logoutUser(): Promise<void> {
  return fetchAPI<void>("/auth/logout", {
    method: "POST",
  });
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>(`/auth/verify-email/confirm?token=${token}`, {
    skipAuth: true,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  return fetchAPI<void>("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  const request: ResetPasswordRequest = { password, confirmPassword };
  return fetchAPI<AuthResponse>(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true,
  });
}
