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
    let data: any;

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
      console.log("[API] Error response:", { url, status: response.status, body: data });
      if (response.status === 401) {
        throw new APIError(401, { message: "Unauthorized" } as ErrorResponse);
      }
      if (response.status === 404) {
        console.log("[API] 404 Not Found for:", url);
      }
      let errorMessage = "Unexpected server error";
      if (typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, any>;
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      throw new APIError(response.status, { message: errorMessage } as ErrorResponse);
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
