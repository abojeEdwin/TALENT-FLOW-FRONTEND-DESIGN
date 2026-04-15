import { ErrorResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export class APIError extends Error {
  constructor(
    public status: number,
    public data: ErrorResponse
  ) {
    super(data.message || "API Error");
    this.name = "APIError";
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers: Record<string, string> = {};

  // Add JWT token if not skipping auth
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // If body is FormData, don't set Content-Type (let browser set it with boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add custom headers (but don't override Content-Type for FormData)
  if (customHeaders) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type' || !(fetchOptions.body instanceof FormData)) {
        headers[key] = value;
      }
    });
  }

  const url = `${API_BASE_URL}/${API_VERSION}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (!response.ok && response.status !== 404) {
      if (response.status === 401) {
        throw new APIError(401, { message: "Unauthorized" } as ErrorResponse);
      }
    }

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new APIError(401, { message: "Unauthorized" } as ErrorResponse);
      }
      let errorMessage = "Unexpected server error";
      if (typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, unknown>;
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors as Record<string, string>).join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message as string;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      throw new APIError(response.status, { message: errorMessage } as ErrorResponse);
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    
    throw new Error("Network error");
  }
}

export { fetchAPI };
