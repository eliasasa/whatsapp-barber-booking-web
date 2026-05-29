import { API_BASE_URL } from "./config";

type RequestInitSafe = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

function getAuthToken(): string | null {
  // Only runs in client environment
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInitSafe,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof init?.headers === "object" && init?.headers !== null
      ? (init.headers as Record<string, string>)
      : {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Resolve absolute URL: if `url` is relative, prefix API_BASE_URL.
  let requestUrl = url;
  try {
    // If it's not an absolute URL, prefix with API_BASE_URL
    const isAbsolute = /^(https?:)?\/\//i.test(url);
    if (!isAbsolute) {
      const base = API_BASE_URL.replace(/\/$/, "");
      requestUrl = `${base}${url.startsWith("/") ? url : `/${url}`}`;
    }
  } catch {
    requestUrl = url;
  }

  const response = await fetch(requestUrl, {
    ...init,
    headers,
  });

  const responseBody = await response.text();

  if (!response.ok) {
    if (response.status === 401 && token && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.assign("/login");
    }

    throw new Error(
      `API error (${response.status}): ${responseBody || response.statusText}`,
    );
  }

  if (!responseBody) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseBody) as T;
  } catch {
    return responseBody as T;
  }
}
