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
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  } as Record<string, string>;

  // Add JWT token if not skipping auth
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}/${API_VERSION}${endpoint}`;

  try {
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: fetchOptions.method || "GET",
        url,
        body: fetchOptions.body,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new APIError(401, { message: "Unauthorized" } as ErrorResponse);
      }
      const errorData = data as ErrorResponse;
      throw new APIError(response.status, {
        ...errorData,
        message: errorData.errors 
          ? Object.values(errorData.errors).join(", ") 
          : errorData.message || "Validation failed"
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        url,
        status: response.status,
        data,
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 401) {
        console.log("Not authenticated");
      } else {
        console.error("API Error:", error);
      }
      throw error;
    }
    console.error("API Error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    
    throw new Error("Network error");
  }
}

export { fetchAPI };
